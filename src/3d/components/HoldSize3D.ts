import { RegisterComponent } from '../../ecs/Component';
import { oav } from '../../objectview/ObjectView';
import { watcher } from '../../watcher/watcher';
import { Camera3D } from '../cameras/Camera3D';
import { Component3D } from '../core/Component3D';

declare module '../../ecs/Component' { interface ComponentMap { HoldSize3D: HoldSize3D; } }

/**
 * 保持固定缩放尺寸。
 */
@RegisterComponent({ name: 'HoldSize3D', menu: 'Layout/HoldSize3D' })
export class HoldSize3D extends Component3D
{
    declare __class__: 'HoldSize3D';

    /**
     * 保持缩放尺寸
     */
    @oav()
    holdSize = 1;

    /**
     * 相机
     */
    @oav()
    camera: Camera3D;

    init()
    {
        watcher.watch(this as HoldSize3D, 'holdSize', this._invalidateGlobalTransform, this);
        watcher.watch(this as HoldSize3D, 'camera', this._onCameraChanged, this);
        this.node3d.emitter.on('updateGlobalMatrix', this._onUpdateLocalToWorldMatrix, this);
    }

    dispose()
    {
        this.camera = null;
        this.node3d.emitter.off('updateGlobalMatrix', this._onUpdateLocalToWorldMatrix, this);
        super.dispose();
    }

    private _onCameraChanged(value: Camera3D, oldValue: Camera3D)
    {
        if (oldValue) oldValue.emitter.off('globalMatrixChanged', this._invalidateGlobalTransform, this);
        if (value) value.emitter.on('globalMatrixChanged', this._invalidateGlobalTransform, this);
        this._invalidateGlobalTransform();
    }

    private _invalidateGlobalTransform()
    {
        if (this._entity) this.entity['_invalidateGlobalMatrix']();
    }

    private _onUpdateLocalToWorldMatrix()
    {
        const _globalMatrix = this.entity['_globalMatrix'];
        if (this.holdSize && this.camera && _globalMatrix)
        {
            const depthScale = this._getDepthScale(this.camera);
            const vec = _globalMatrix.toTRS();
            vec[2].scaleNumber(depthScale * this.holdSize);
            _globalMatrix.fromTRS(vec[0], vec[1], vec[2]);

            console.assert(!isNaN(_globalMatrix.elements[0]));
        }
    }

    private _getDepthScale(camera: Camera3D)
    {
        const cameraGlobalMatrix = camera.node3d.globalMatrix;
        const distance = this.node3d.worldPosition.subTo(cameraGlobalMatrix.getPosition());
        if (distance.length === 0)
        {
            distance.x = 1;
        }
        const depth = distance.dot(cameraGlobalMatrix.getAxisZ());
        let scale = camera.getScaleByDepth(depth);
        // 限制在放大缩小100倍之间，否则容易出现矩阵不可逆问题
        scale = Math.max(Math.min(100, scale), 0.01);

        return scale;
    }
}
