import { Vector2, Vector3 } from '@feng3d/math';
import { oav } from '@feng3d/objectview';
import { gPartial } from '@feng3d/polyfill';
import { decoratorRegisterClass, serialize } from '@feng3d/serialization';
import { watcher } from '@feng3d/watcher';
import { Object3D } from '../core/Object3D';
import { Geometry } from '../geometry/Geometry';
import { geometryUtils } from '../geometry/GeometryUtils';

declare global
{
    export interface MixinsGeometryTypes
    {
        Ring: RingGeometry
    }

    export interface MixinsDefaultGeometry
    {
        Ring: RingGeometry;
    }

    export interface MixinsPrimitiveObject3D
    {
        Ring: Object3D;
    }
}

export interface IRingGeometry
{
    innerRadius: number;

    outerRadius: number;

    thetaSegments: number;

    phiSegments: number;

    thetaStart: number;

    thetaLength: number;
}

/**
 * 环
 *
 * @see https://github.com/mrdoob/three.js/blob/dev/src/geometries/RingGeometry.js
 */
@decoratorRegisterClass()
export class RingGeometry extends Geometry
{
    __class__: 'RingGeometry' = 'RingGeometry';

    @serialize
    @oav()
    innerRadius = 0.5;

    @serialize
    @oav()
    outerRadius = 1;

    @serialize
    @oav()
    thetaSegments = 8;

    @serialize
    @oav()
    phiSegments = 1;

    @serialize
    @oav()
    thetaStart = 0;

    @serialize
    @oav()
    thetaLength = Math.PI * 2;

    constructor(param?: gPartial<RingGeometry>)
    {
        super();
        Object.assign(this, param);
        watcher.watch(this as RingGeometry, 'innerRadius', this.invalidateGeometry, this);
        watcher.watch(this as RingGeometry, 'outerRadius', this.invalidateGeometry, this);
        watcher.watch(this as RingGeometry, 'thetaSegments', this.invalidateGeometry, this);
        watcher.watch(this as RingGeometry, 'phiSegments', this.invalidateGeometry, this);
        watcher.watch(this as RingGeometry, 'thetaStart', this.invalidateGeometry, this);
        watcher.watch(this as RingGeometry, 'thetaLength', this.invalidateGeometry, this);
    }

    /**
     * 构建几何体数据
     */
    protected buildGeometry()
    {
        const { indices, positions, normals, uvs } = RingGeometry.buildGeometry(this);

        const tangents = geometryUtils.createVertexTangents(indices, positions, uvs);

        this.indexBuffer = { array: indices };
        this.attributes.a_position = { array: positions, itemSize: 3 };
        this.attributes.a_normal = { array: normals, itemSize: 3 };
        this.attributes.a_tangent = { array: tangents, itemSize: 3 };
        this.attributes.a_uv = { array: uvs, itemSize: 2 };
    }

    /**
     * 构建几何体数据
     */
    static buildGeometry({ innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength }: IRingGeometry)
    {
        thetaSegments = Math.max(3, thetaSegments);
        phiSegments = Math.max(1, phiSegments);

        // buffers

        const indices = [];
        const positions = [];
        const normals = [];
        const uvs = [];

        // some helper variables

        let radius = innerRadius;
        const radiusStep = ((outerRadius - innerRadius) / phiSegments);
        const vertex = new Vector3();
        const uv = new Vector2();

        // generate vertices, normals and uvs

        for (let j = 0; j <= phiSegments; j++)
        {
            for (let i = 0; i <= thetaSegments; i++)
            {
                // values are generate from the inside of the ring to the outside

                const segment = thetaStart + i / thetaSegments * thetaLength;

                // vertex

                vertex.x = radius * Math.cos(segment);
                vertex.y = radius * Math.sin(segment);

                positions.push(vertex.x, vertex.y, vertex.z);

                // normal

                normals.push(0, 0, 1);

                // uv

                uv.x = (vertex.x / outerRadius + 1) / 2;
                uv.y = (vertex.y / outerRadius + 1) / 2;

                uvs.push(uv.x, uv.y);
            }

            // increase the radius for next row of vertices

            radius += radiusStep;
        }

        // indices

        for (let j = 0; j < phiSegments; j++)
        {
            const thetaSegmentLevel = j * (thetaSegments + 1);

            for (let i = 0; i < thetaSegments; i++)
            {
                const segment = i + thetaSegmentLevel;

                const a = segment;
                const b = segment + thetaSegments + 1;
                const c = segment + thetaSegments + 2;
                const d = segment + 1;

                // faces

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        // build geometry
        return { indices, positions, normals, uvs };
    }
}
