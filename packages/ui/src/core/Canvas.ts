import { Behaviour, Object3D, RegisterComponent, View } from '@feng3d/core';
import { Matrix4x4, Ray3, Vector3 } from '@feng3d/math';
import { oav } from '@feng3d/objectview';
import { decoratorRegisterClass } from '@feng3d/serialization';
import { serialize } from '@feng3d/serialization';
import { UIRenderMode } from '../enums/UIRenderMode';
import { Transform2D } from './Transform2D';

declare global
{
    export interface MixinsComponentMap
    {
        Canvas: Canvas
    }

    export interface MixinsPrimitiveObject3D
    {
        Canvas: Object3D;
    }
}

/**
 * Element that can be used for screen rendering.
 *
 * 能够被用于屏幕渲染的元素
 */
@RegisterComponent()
@decoratorRegisterClass()
export class Canvas extends Behaviour
{
    /**
     * Is the Canvas in World or Overlay mode?
     *
     * 画布是在世界或覆盖模式?
     */
    @serialize
    @oav({ component: 'OAVEnum', tooltip: '画布是在世界或覆盖模式', componentParam: { enumClass: UIRenderMode } })
    renderMode = UIRenderMode.ScreenSpaceOverlay;

    /**
     * 获取鼠标射线（与鼠标重叠的摄像机射线）
     */
    mouseRay = new Ray3(new Vector3(), new Vector3(0, 0, 1));

    /**
     * 投影矩阵
     *
     * 渲染前自动更新
     */
    projection = new Matrix4x4();

    /**
     * 最近距离
     */
    @serialize
    @oav()
    near = -1000;

    /**
     * 最远距离
     */
    @serialize
    @oav()
    far = 10000;

    init()
    {
    }

    /**
     * 更新布局
     *
     * @param width 画布宽度
     * @param height 画布高度
     */
    layout(width: number, height: number)
    {
        if (width === 0) width = 100;
        if (height === 0) height = 100;

        this.transform2D.size.x = width;
        this.transform2D.size.y = height;

        this.transform2D.pivot.set(0, 0);

        this.object3D.x = 0;
        this.object3D.y = 0;
        this.object3D.z = 0;

        this.object3D.rx = 0;
        this.object3D.ry = 0;
        this.object3D.rz = 0;

        this.object3D.sx = 1;
        this.object3D.sy = 1;
        this.object3D.sz = 1;

        const near = this.near;
        const far = this.far;
        this.projection.identity().appendTranslation(0, 0, -(far + near) / 2).appendScale(2 / width, -2 / height, 2 / (far - near)).appendTranslation(-1, 1, 0);
    }

    /**
     * 计算鼠标射线
     *
     * @param view
     */
    calcMouseRay3D(view: View)
    {
        this.mouseRay.origin.set(view.mousePos.x, view.mousePos.y, 0);
    }
}

Object3D.registerPrimitive('Canvas', (g) =>
{
    g.addComponent(Transform2D);
    g.addComponent(Canvas);
});