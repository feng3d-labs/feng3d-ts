import { Camera } from '../cameras/Camera';
import { Node3D } from '../core/Node3D';
import { Renderer } from '../core/Renderer';
import { Scene } from './Scene';

/**
 * 场景拾取缓存
 */
export class ScenePickCache
{
    private scene: Scene;
    private camera: Camera;

    //
    private _activeModels: Renderer[];
    private _blendItems: Renderer[];
    private _unBlendItems: Renderer[];

    constructor(scene: Scene, camera: Camera)
    {
        this.scene = scene;
        this.camera = camera;
    }

    /**
     * 获取需要渲染的对象
     *
     * #### 渲染需求条件
     * 1. visible == true
     * 1. 在摄像机视锥内
     * 1. model.enabled == true
     *
     */
    get activeModels()
    {
        if (this._activeModels)
        { return this._activeModels; }

        const models: Renderer[] = this._activeModels = [];
        const frustum = this.camera.frustum;

        let object3Ds = [this.scene.entity];
        while (object3Ds.length > 0)
        {
            const object3D = object3Ds.pop();

            if (!object3D.visible)
            { continue; }
            const model = object3D.getComponent(Renderer);
            if (model && model.enabled)
            {
                if (model.selfWorldBounds)
                {
                    if (frustum.intersectsBox(model.selfWorldBounds))
                    { models.push(model); }
                }
            }
            object3Ds = object3Ds.concat(object3D.children as Node3D[]);
        }

        return models;
    }

    /**
     * 半透明渲染对象
     */
    get blendItems()
    {
        if (this._blendItems)
        { return this._blendItems; }

        const models = this.activeModels;
        const cameraPos = this.camera.entity.worldPosition;

        const blendItems = this._blendItems = models.filter((item) =>
            item.material.renderParams.enableBlend).sort((b, a) => a.entity.worldPosition.subTo(cameraPos).lengthSquared - b.entity.worldPosition.subTo(cameraPos).lengthSquared);

        return blendItems;
    }

    /**
     * 半透明渲染对象
     */
    get unBlendItems()
    {
        if (this._unBlendItems)
        { return this._unBlendItems; }

        const models = this.activeModels;
        const cameraPos = this.camera.entity.worldPosition;

        const unBlendItems = this._unBlendItems = models.filter((item) =>
            !item.material.renderParams.enableBlend).sort((a, b) => a.entity.worldPosition.subTo(cameraPos).lengthSquared - b.entity.worldPosition.subTo(cameraPos).lengthSquared);

        return unBlendItems;
    }

    clear()
    {
        this._blendItems = null;
        this._unBlendItems = null;
        this._activeModels = null;
    }
}
