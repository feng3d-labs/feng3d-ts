import { createNodeMenu } from '../../core/CreateNodeMenu';
import { RegisterComponent } from '../../ecs/Component';
import { Box3 } from '../../math/geom/Box3';
import { Matrix4x4 } from '../../math/geom/Matrix4x4';
import { Vector3 } from '../../math/geom/Vector3';
import { $set } from '../../serialization/Serialization';
import { Camera3D } from '../cameras/Camera3D';
import { OrthographicCamera3D } from '../cameras/OrthographicCamera3D';
import { Node3D } from '../core/Node3D';
import { Renderable3D } from '../core/Renderable3D';
import { Scene3D } from '../core/Scene3D';
import { Light3D } from './Light3D';
import { LightType } from './LightType';

declare module '../../ecs/Component' { interface ComponentMap { DirectionalLight3D: DirectionalLight3D; } }

declare module '../core/Node3D' { interface PrimitiveNode3D { 'Directional light': Node3D; } }

/**
 * 方向光源
 */
@RegisterComponent({ name: 'DirectionalLight3D', menu: 'Rendering/DirectionalLight3D' })
export class DirectionalLight3D extends Light3D
{
    declare __class__: 'DirectionalLight3D';

    lightType = LightType.Directional;

    private orthographicLens: OrthographicCamera3D;

    /**
     * 光源位置
     */
    get position()
    {
        return this.shadowCamera.node3d.worldPosition;
    }

    /**
     * 通过视窗摄像机进行更新
     * @param viewCamera 视窗摄像机
     */
    updateShadowByCamera(scene: Scene3D, viewCamera: Camera3D, models: Renderable3D[])
    {
        const worldBounds: Box3 = models.reduce((pre: Box3, i) =>
        {
            const box = i.node3d.boundingBox.worldBounds;
            if (!pre)
            { return box.clone(); }
            pre.union(box);

            return pre;
        }, null) || new Box3(new Vector3(), new Vector3(1, 1, 1));

        //
        const center = worldBounds.getCenter();
        const radius = worldBounds.getSize().length / 2;
        //
        this.shadowCamera.node3d.position = center.addTo(this.direction.scaleNumberTo(radius + this.shadowCameraNear).negate());
        this.shadowCamera.node3d.lookAt(center, this.shadowCamera.node3d.matrix.getAxisY());
        //
        if (!this.orthographicLens)
        {
            this.shadowCamera.projectionMatrix = new Matrix4x4().setOrtho(-radius, radius, -radius, radius, this.shadowCameraNear, this.shadowCameraNear + radius * 2);
        }
        else
        {
            $set(this.orthographicLens, { size: radius, near: this.shadowCameraNear, far: this.shadowCameraNear + radius * 2 });
        }
    }
}

Node3D.registerPrimitive('Directional light', (g) =>
{
    g.addComponent('DirectionalLight3D');
});

// 在 Hierarchy 界面新增右键菜单项
createNodeMenu.push(
    {
        path: 'Light/Directional light',
        priority: -2,
        click: () =>
            Node3D.createPrimitive('Directional light')
    }
);
