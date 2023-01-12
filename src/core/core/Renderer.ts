import { Box3 } from '../../math/geom/Box3';
import { Ray3 } from '../../math/geom/Ray3';
import { RenderAtomic } from '../../renderer/data/RenderAtomic';
import { PickingCollisionVO } from '../pick/Raycaster';
import { Component3D } from './Component3D';
import { IRayCastable } from './IRayCastable';
import { IRenderable } from './IRenderable';

/**
 * 渲染器组件
 *
 * 该渲染器组件为虚类，无法直接实例化，但如果需要渲染则必须包含渲染器组件的子类。
 *
 * 可渲染对象也就意味着拥有判断是否需要渲染的包围盒，因此该组件提供包围盒管理功能。
 *
 * @see https://docs.unity3d.com/cn/current/ScriptReference/Renderer.html
 */
export class Renderer extends Component3D implements IRenderable, IRayCastable
{
    /**
     * 渲染原子（该对象会收集一切渲染所需数据以及参数）
     */
    readonly renderAtomic = new RenderAtomic();

    protected _localBounds: Box3;
    protected _worldBounds: Box3;

    /**
     * 局部包围盒
     */
    get localBounds()
    {
        if (!this._localBounds)
        {
            this._updateBounds();
        }

        return this._localBounds;
    }

    /**
     * 世界包围盒
     */
    get worldBounds()
    {
        if (!this._worldBounds)
        {
            this._updateWorldBounds();
        }

        return this._worldBounds;
    }

    /**
     * 与世界空间射线相交
     *
     * @param _worldRay 世界空间射线
     *
     * @return 相交信息
     */
    worldRayIntersection(_worldRay: Ray3): PickingCollisionVO
    {
        throw '请在子类中实现！';
    }

    /**
     * 更新世界边界
     */
    protected _updateWorldBounds()
    {
        this._worldBounds = this.localBounds.applyMatrixTo(this.node3d.globalMatrix);
    }

    /**
     * 处理包围盒变换事件
     */
    protected _onBoundsInvalid()
    {
        this._localBounds = null;
        this._worldBounds = null;

        this.emitter.emit('selfBoundsChanged', this);
    }

    protected _updateBounds() { }
}
