import { oav } from '../../objectview/ObjectView';
import { Serializable } from '../../serialization/Serializable';
import { watcher } from '../../watcher/watcher';
import { Camera } from '../cameras/Camera';
import { AddComponentMenu } from '../Menu';
import { Component, RegisterComponent } from '../../ecs/Component';

declare global
{
    export interface MixinsComponentMap
    {
        BillboardComponent: BillboardComponent;
    }
}

@AddComponentMenu('Layout/BillboardComponent')
@RegisterComponent()
@Serializable()
export class BillboardComponent extends Component
{
    __class__: 'BillboardComponent';

    /**
     * 相机
     */
    @oav()
    camera: Camera;

    constructor()
    {
        super();
        watcher.watch(this as BillboardComponent, 'camera', this._onCameraChanged, this);
    }

    init()
    {
        super.init();
        this.entity.on('updateGlobalMatrix', this._onUpdateLocalToWorldMatrix, this);
        this._invalidHoldSizeMatrix();
    }

    private _onCameraChanged(value: Camera, oldValue: Camera)
    {
        if (oldValue) oldValue.off('globalMatrixChanged', this._invalidHoldSizeMatrix, this);
        if (value) value.on('globalMatrixChanged', this._invalidHoldSizeMatrix, this);
        this._invalidHoldSizeMatrix();
    }

    private _invalidHoldSizeMatrix()
    {
        if (this._entity) this.entity['_invalidateGlobalMatrix']();
    }

    private _onUpdateLocalToWorldMatrix()
    {
        const _globalMatrix = this.entity['_globalMatrix'];
        if (_globalMatrix && this.camera)
        {
            const camera = this.camera;
            const cameraPos = camera.entity.worldPosition;
            const yAxis = camera.entity.globalMatrix.getAxisY();
            _globalMatrix.lookAt(cameraPos, yAxis);
        }
    }

    dispose()
    {
        this.camera = null;
        this.entity.off('updateGlobalMatrix', this._onUpdateLocalToWorldMatrix, this);
        super.dispose();
    }
}
