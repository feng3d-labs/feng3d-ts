namespace CANNON
{
    export class RaycastVehicle
    {

        chassisBody: Body;

        /**
         * An array of WheelInfo objects.
         */
        wheelInfos: WheelInfo[];

        /**
         * Will be set to true if the car is sliding.
         */
        sliding: boolean;

        world: World;

        /**
         * Index of the right axis, 0=x, 1=y, 2=z
         */
        indexRightAxis: number;

        /**
         * Index of the forward axis, 0=x, 1=y, 2=z
         */
        indexForwardAxis: number;

        /**
         * Index of the up axis, 0=x, 1=y, 2=z
         */
        indexUpAxis: number;

        currentVehicleSpeedKmHour: number;

        preStepCallback()
        {
            this.updateVehicle(this.world.dt);
        }

        /**
         * Vehicle helper class that casts rays from the wheel positions towards the ground and applies forces.
         * 
         * @param options 
         */
        constructor(options: { chassisBody?: Body, indexRightAxis?: number, indexForwardAxis?: number, indexUpAxis?: number } = {})
        {
            this.chassisBody = options.chassisBody;
            this.wheelInfos = [];
            this.sliding = false;
            this.world = null;
            this.indexRightAxis = typeof (options.indexRightAxis) !== 'undefined' ? options.indexRightAxis : 1;
            this.indexForwardAxis = typeof (options.indexForwardAxis) !== 'undefined' ? options.indexForwardAxis : 0;
            this.indexUpAxis = typeof (options.indexUpAxis) !== 'undefined' ? options.indexUpAxis : 2;
        }

        /**
         * Add a wheel. For information about the options, see WheelInfo.
         * 
         * @param options
         */
        addWheel(options = {})
        {
            var info = new WheelInfo(options);
            var index = this.wheelInfos.length;
            this.wheelInfos.push(info);

            return index;
        }

        /**
         * Set the steering value of a wheel.
         * 
         * @param value
         * @param wheelIndex
         */
        setSteeringValue(value: number, wheelIndex: number)
        {
            var wheel = this.wheelInfos[wheelIndex];
            wheel.steering = value;
        }

        /**
         * Set the wheel force to apply on one of the wheels each time step
         * 
         * @param value
         * @param wheelIndex
         */
        applyEngineForce(value: number, wheelIndex: number)
        {
            this.wheelInfos[wheelIndex].engineForce = value;
        }

        /**
         * Set the braking force of a wheel
         * 
         * @param brake
         * @param wheelIndex
         */
        setBrake(brake: number, wheelIndex: number)
        {
            this.wheelInfos[wheelIndex].brake = brake;
        }

        /**
         * Add the vehicle including its constraints to the world.
         * 
         * @param world
         */
        addToWorld(world: World)
        {
            world.addBody(this.chassisBody);
            this.world = world;
            world.on('preStep', this.preStepCallback, this);
        }

        /**
         * Get one of the wheel axles, world-oriented.
         * @param axisIndex
         * @param result
         */
        getVehicleAxisWorld(axisIndex: number, result: feng3d.Vector3)
        {
            result.init(
                axisIndex === 0 ? 1 : 0,
                axisIndex === 1 ? 1 : 0,
                axisIndex === 2 ? 1 : 0
            );
            this.chassisBody.vectorToWorldFrame(result, result);
        }

        updateVehicle(timeStep: number)
        {
            var wheelInfos = this.wheelInfos;
            var numWheels = wheelInfos.length;
            var chassisBody = this.chassisBody;

            for (var i = 0; i < numWheels; i++)
            {
                this.updateWheelTransform(i);
            }

            this.currentVehicleSpeedKmHour = 3.6 * chassisBody.velocity.length;

            var forwardWorld = new feng3d.Vector3();
            this.getVehicleAxisWorld(this.indexForwardAxis, forwardWorld);

            if (forwardWorld.dot(chassisBody.velocity) < 0)
            {
                this.currentVehicleSpeedKmHour *= -1;
            }

            // simulate suspension
            for (var i = 0; i < numWheels; i++)
            {
                this.castRay(wheelInfos[i]);
            }

            this.updateSuspension(timeStep);

            var impulse = new feng3d.Vector3();
            var relpos = new feng3d.Vector3();
            for (var i = 0; i < numWheels; i++)
            {
                //apply suspension force
                var wheel = wheelInfos[i];
                var suspensionForce = wheel.suspensionForce;
                if (suspensionForce > wheel.maxSuspensionForce)
                {
                    suspensionForce = wheel.maxSuspensionForce;
                }
                wheel.raycastResult.hitNormalWorld.scaleNumberTo(suspensionForce * timeStep, impulse);

                wheel.raycastResult.hitPointWorld.subTo(chassisBody.position, relpos);
                chassisBody.applyImpulse(impulse, relpos);
            }

            this.updateFriction(timeStep);

            var hitNormalWorldScaledWithProj = new feng3d.Vector3();
            var fwd = new feng3d.Vector3();
            var vel = new feng3d.Vector3();
            for (i = 0; i < numWheels; i++)
            {
                var wheel = wheelInfos[i];
                //var relpos = new Vec3();
                //wheel.chassisConnectionPointWorld.vsub(chassisBody.position, relpos);
                chassisBody.getVelocityAtWorldPoint(wheel.chassisConnectionPointWorld, vel);

                // Hack to get the rotation in the correct direction
                var m = 1;
                switch (this.indexUpAxis)
                {
                    case 1:
                        m = -1;
                        break;
                }

                if (wheel.isInContact)
                {

                    this.getVehicleAxisWorld(this.indexForwardAxis, fwd);
                    var proj = fwd.dot(wheel.raycastResult.hitNormalWorld);
                    wheel.raycastResult.hitNormalWorld.scaleNumberTo(proj, hitNormalWorldScaledWithProj);

                    fwd.subTo(hitNormalWorldScaledWithProj, fwd);

                    var proj2 = fwd.dot(vel);
                    wheel.deltaRotation = m * proj2 * timeStep / wheel.radius;
                }

                if ((wheel.sliding || !wheel.isInContact) && wheel.engineForce !== 0 && wheel.useCustomSlidingRotationalSpeed)
                {
                    // Apply custom rotation when accelerating and sliding
                    wheel.deltaRotation = (wheel.engineForce > 0 ? 1 : -1) * wheel.customSlidingRotationalSpeed * timeStep;
                }

                // Lock wheels
                if (Math.abs(wheel.brake) > Math.abs(wheel.engineForce))
                {
                    wheel.deltaRotation = 0;
                }

                wheel.rotation += wheel.deltaRotation; // Use the old value
                wheel.deltaRotation *= 0.99; // damping of rotation when not in contact
            }
        }

        updateSuspension(deltaTime: number)
        {
            var chassisBody = this.chassisBody;
            var chassisMass = chassisBody.mass;
            var wheelInfos = this.wheelInfos;
            var numWheels = wheelInfos.length;

            for (var w_it = 0; w_it < numWheels; w_it++)
            {
                var wheel = wheelInfos[w_it];

                if (wheel.isInContact)
                {
                    var force;

                    // Spring
                    var susp_length = wheel.suspensionRestLength;
                    var current_length = wheel.suspensionLength;
                    var length_diff = (susp_length - current_length);

                    force = wheel.suspensionStiffness * length_diff * wheel.clippedInvContactDotSuspension;

                    // Damper
                    var projected_rel_vel = wheel.suspensionRelativeVelocity;
                    var susp_damping;
                    if (projected_rel_vel < 0)
                    {
                        susp_damping = wheel.dampingCompression;
                    } else
                    {
                        susp_damping = wheel.dampingRelaxation;
                    }
                    force -= susp_damping * projected_rel_vel;

                    wheel.suspensionForce = force * chassisMass;
                    if (wheel.suspensionForce < 0)
                    {
                        wheel.suspensionForce = 0;
                    }
                } else
                {
                    wheel.suspensionForce = 0;
                }
            }
        }

        /**
         * Remove the vehicle including its constraints from the world.
         * 
         * @param world
         */
        removeFromWorld(world: World)
        {
            world.removeBody(this.chassisBody);
            world.off('preStep', this.preStepCallback);
            this.world = null;
        }

        castRay(wheel: WheelInfo)
        {
            var rayvector = new feng3d.Vector3();
            var target = new feng3d.Vector3();

            this.updateWheelTransformWorld(wheel);
            var chassisBody = this.chassisBody;

            var depth = -1;

            var raylen = wheel.suspensionRestLength + wheel.radius;

            wheel.directionWorld.scaleNumberTo(raylen, rayvector);
            var source = wheel.chassisConnectionPointWorld;
            source.addTo(rayvector, target);
            var raycastResult = wheel.raycastResult;

            raycastResult.reset();
            // Turn off ray collision with the chassis temporarily
            var oldState = chassisBody.collisionResponse;
            chassisBody.collisionResponse = false;

            // Cast ray against world
            this.world.rayTest(source, target, raycastResult);
            chassisBody.collisionResponse = oldState;

            var object = raycastResult.body;

            if (object)
            {
                depth = raycastResult.distance;
                wheel.raycastResult.hitNormalWorld = raycastResult.hitNormalWorld;
                wheel.isInContact = true;

                var hitDistance = raycastResult.distance;
                wheel.suspensionLength = hitDistance - wheel.radius;

                // clamp on max suspension travel
                var minSuspensionLength = wheel.suspensionRestLength - wheel.maxSuspensionTravel;
                var maxSuspensionLength = wheel.suspensionRestLength + wheel.maxSuspensionTravel;
                if (wheel.suspensionLength < minSuspensionLength)
                {
                    wheel.suspensionLength = minSuspensionLength;
                }
                if (wheel.suspensionLength > maxSuspensionLength)
                {
                    wheel.suspensionLength = maxSuspensionLength;
                    wheel.raycastResult.reset();
                }

                var denominator = wheel.raycastResult.hitNormalWorld.dot(wheel.directionWorld);

                var chassis_velocity_at_contactPoint = new feng3d.Vector3();
                chassisBody.getVelocityAtWorldPoint(wheel.raycastResult.hitPointWorld, chassis_velocity_at_contactPoint);

                var projVel = wheel.raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);

                if (denominator >= -0.1)
                {
                    wheel.suspensionRelativeVelocity = 0;
                    wheel.clippedInvContactDotSuspension = 1 / 0.1;
                } else
                {
                    var inv = -1 / denominator;
                    wheel.suspensionRelativeVelocity = projVel * inv;
                    wheel.clippedInvContactDotSuspension = inv;
                }

            } else
            {

                //put wheel info as in rest position
                wheel.suspensionLength = wheel.suspensionRestLength + 0 * wheel.maxSuspensionTravel;
                wheel.suspensionRelativeVelocity = 0.0;
                wheel.directionWorld.scaleNumberTo(-1, wheel.raycastResult.hitNormalWorld);
                wheel.clippedInvContactDotSuspension = 1.0;
            }

            return depth;
        }

        updateWheelTransformWorld(wheel: WheelInfo)
        {
            wheel.isInContact = false;
            var chassisBody = this.chassisBody;
            chassisBody.pointToWorldFrame(wheel.chassisConnectionPointLocal, wheel.chassisConnectionPointWorld);
            chassisBody.vectorToWorldFrame(wheel.directionLocal, wheel.directionWorld);
            chassisBody.vectorToWorldFrame(wheel.axleLocal, wheel.axleWorld);
        }

        /**
         * Update one of the wheel transform.
         * Note when rendering wheels: during each step, wheel transforms are updated BEFORE the chassis; ie. their position becomes invalid after the step. Thus when you render wheels, you must update wheel transforms before rendering them. See raycastVehicle demo for an example.
         * 
         * @param wheelIndex The wheel index to update.
         */
        updateWheelTransform(wheelIndex: number)
        {
            var up = new feng3d.Vector3();
            var right = new feng3d.Vector3();
            var fwd = new feng3d.Vector3();

            var wheel = this.wheelInfos[wheelIndex];
            this.updateWheelTransformWorld(wheel);

            wheel.directionLocal.scaleNumberTo(-1, up);
            right.copy(wheel.axleLocal);
            up.crossTo(right, fwd);
            fwd.normalize();
            right.normalize();

            // Rotate around steering over the wheelAxle
            var steering = wheel.steering;
            var steeringOrn = new feng3d.Quaternion();
            steeringOrn.fromAxisAngle(up, steering);

            var rotatingOrn = new feng3d.Quaternion();
            rotatingOrn.fromAxisAngle(right, wheel.rotation);

            // World rotation of the wheel
            var q = wheel.worldTransform.quaternion;
            this.chassisBody.quaternion.multTo(steeringOrn, q);
            q.multTo(rotatingOrn, q);

            q.normalize();

            // world position of the wheel
            var p = wheel.worldTransform.position;
            p.copy(wheel.directionWorld);
            p.scaleNumberTo(wheel.suspensionLength, p);
            p.addTo(wheel.chassisConnectionPointWorld, p);
        }

        /**
         * Get the world transform of one of the wheels
         * 
         * @param wheelIndex
         */
        getWheelTransformWorld(wheelIndex: number)
        {
            return this.wheelInfos[wheelIndex].worldTransform;
        }

        updateFriction(timeStep: number)
        {
            var surfNormalWS_scaled_proj = new feng3d.Vector3();

            //calculate the impulse, so that the wheels don't move sidewards
            var wheelInfos = this.wheelInfos;
            var numWheels = wheelInfos.length;
            var chassisBody = this.chassisBody;
            var forwardWS: feng3d.Vector3[] = [];
            var axle: feng3d.Vector3[] = [];

            for (var i = 0; i < numWheels; i++)
            {
                var wheel = wheelInfos[i];
                wheel.sideImpulse = 0;
                wheel.forwardImpulse = 0;
                if (!forwardWS[i])
                {
                    forwardWS[i] = new feng3d.Vector3();
                }
                if (!axle[i])
                {
                    axle[i] = new feng3d.Vector3();
                }
            }

            for (var i = 0; i < numWheels; i++)
            {
                var wheel = wheelInfos[i];

                var groundObject = wheel.raycastResult.body;

                if (groundObject)
                {
                    var axlei = axle[i];
                    var wheelTrans = this.getWheelTransformWorld(i);

                    // Get world axle
                    wheelTrans.vectorToWorldFrame(directions[this.indexRightAxis], axlei);

                    var surfNormalWS = wheel.raycastResult.hitNormalWorld;
                    var proj = axlei.dot(surfNormalWS);
                    surfNormalWS.scaleNumberTo(proj, surfNormalWS_scaled_proj);
                    axlei.subTo(surfNormalWS_scaled_proj, axlei);
                    axlei.normalize();

                    surfNormalWS.crossTo(axlei, forwardWS[i]);
                    forwardWS[i].normalize();

                    wheel.sideImpulse = resolveSingleBilateral(
                        chassisBody,
                        wheel.raycastResult.hitPointWorld,
                        groundObject,
                        wheel.raycastResult.hitPointWorld,
                        axlei
                    );

                }
            }

            var sideFactor = 1;
            var fwdFactor = 0.5;

            this.sliding = false;
            for (var i = 0; i < numWheels; i++)
            {
                var wheel = wheelInfos[i];
                var groundObject = wheel.raycastResult.body;

                var rollingFriction = 0;

                wheel.slipInfo = 1;
                if (groundObject)
                {
                    var defaultRollingFrictionImpulse = 0;
                    var maxImpulse = wheel.brake ? wheel.brake : defaultRollingFrictionImpulse;

                    rollingFriction = calcRollingFriction(chassisBody, groundObject, wheel.raycastResult.hitPointWorld, forwardWS[i], maxImpulse);

                    rollingFriction += wheel.engineForce * timeStep;

                    // rollingFriction = 0;
                    var factor = maxImpulse / rollingFriction;
                    wheel.slipInfo *= factor;
                }

                wheel.forwardImpulse = 0;
                wheel.skidInfo = 1;

                if (groundObject)
                {
                    wheel.skidInfo = 1;

                    var maximp = wheel.suspensionForce * timeStep * wheel.frictionSlip;
                    var maximpSide = maximp;

                    var maximpSquared = maximp * maximpSide;

                    wheel.forwardImpulse = rollingFriction;//wheelInfo.engineForce* timeStep;

                    var x = wheel.forwardImpulse * fwdFactor;
                    var y = wheel.sideImpulse * sideFactor;

                    var impulseSquared = x * x + y * y;

                    wheel.sliding = false;
                    if (impulseSquared > maximpSquared)
                    {
                        this.sliding = true;
                        wheel.sliding = true;

                        var factor = maximp / Math.sqrt(impulseSquared);

                        wheel.skidInfo *= factor;
                    }
                }
            }

            if (this.sliding)
            {
                for (var i = 0; i < numWheels; i++)
                {
                    var wheel = wheelInfos[i];
                    if (wheel.sideImpulse !== 0)
                    {
                        if (wheel.skidInfo < 1)
                        {
                            wheel.forwardImpulse *= wheel.skidInfo;
                            wheel.sideImpulse *= wheel.skidInfo;
                        }
                    }
                }
            }

            // apply the impulses
            for (var i = 0; i < numWheels; i++)
            {
                var wheel = wheelInfos[i];

                var rel_pos = new feng3d.Vector3();
                wheel.raycastResult.hitPointWorld.subTo(chassisBody.position, rel_pos);

                if (wheel.forwardImpulse !== 0)
                {
                    var impulse = new feng3d.Vector3();
                    forwardWS[i].scaleNumberTo(wheel.forwardImpulse, impulse);
                    chassisBody.applyImpulse(impulse, rel_pos);
                }

                if (wheel.sideImpulse !== 0)
                {
                    var groundObject = wheel.raycastResult.body;

                    var rel_pos2 = wheel.raycastResult.hitPointWorld.subTo(groundObject.position);
                    var sideImp = axle[i].scaleNumberTo(wheel.sideImpulse);

                    // Scale the relative position in the up direction with rollInfluence.
                    // If rollInfluence is 1, the impulse will be applied on the hitPoint (easy to roll over), if it is zero it will be applied in the same plane as the center of mass (not easy to roll over).
                    chassisBody.vectorToLocalFrame(rel_pos, rel_pos);
                    rel_pos['xyz'[this.indexUpAxis]] *= wheel.rollInfluence;
                    chassisBody.vectorToWorldFrame(rel_pos, rel_pos);
                    chassisBody.applyImpulse(sideImp, rel_pos);

                    //apply friction impulse on the ground
                    sideImp.scaleNumberTo(-1, sideImp);
                    groundObject.applyImpulse(sideImp, rel_pos2);
                }
            }
        }
    }

    var directions = [
        new feng3d.Vector3(1, 0, 0),
        new feng3d.Vector3(0, 1, 0),
        new feng3d.Vector3(0, 0, 1)
    ];

    function calcRollingFriction(body0: Body, body1: Body, frictionPosWorld: feng3d.Vector3, frictionDirectionWorld: feng3d.Vector3, maxImpulse: number)
    {
        var j1 = 0;
        var contactPosWorld = frictionPosWorld;

        var vel1 = body0.getVelocityAtWorldPoint(contactPosWorld);
        var vel2 = body1.getVelocityAtWorldPoint(contactPosWorld);
        var vel = vel1.subTo(vel2);

        var vrel = frictionDirectionWorld.dot(vel);

        var denom0 = computeImpulseDenominator(body0, frictionPosWorld, frictionDirectionWorld);
        var denom1 = computeImpulseDenominator(body1, frictionPosWorld, frictionDirectionWorld);
        var relaxation = 1;
        var jacDiagABInv = relaxation / (denom0 + denom1);

        // calculate j that moves us to zero relative velocity
        j1 = -vrel * jacDiagABInv;

        if (maxImpulse < j1)
        {
            j1 = maxImpulse;
        }
        if (j1 < -maxImpulse)
        {
            j1 = -maxImpulse;
        }

        return j1;
    }

    function computeImpulseDenominator(body: Body, pos: feng3d.Vector3, normal: feng3d.Vector3)
    {
        var r0 = pos.subTo(body.position);
        var c0 = r0.crossTo(normal);
        var m = body.invInertiaWorld.vmult(c0);
        var vec = m.crossTo(r0);

        return body.invMass + normal.dot(vec);
    }


    //bilateral constraint between two dynamic objects
    function resolveSingleBilateral(body1: Body, pos1: feng3d.Vector3, body2: Body, pos2: feng3d.Vector3, normal: feng3d.Vector3)
    {
        var normalLenSqr = normal.lengthSquared;
        if (normalLenSqr > 1.1)
        {
            return 0; // no impulse
        }

        var vel1 = body1.getVelocityAtWorldPoint(pos1);
        var vel2 = body2.getVelocityAtWorldPoint(pos2, vel2);

        var vel = vel1.subTo(vel2);
        var rel_vel = normal.dot(vel);

        var contactDamping = 0.2;
        var massTerm = 1 / (body1.invMass + body2.invMass);
        var impulse = - contactDamping * rel_vel * massTerm;

        return impulse;
    }
}