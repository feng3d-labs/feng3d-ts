import { Vector2 } from '../../math/geom/Vector2';
import { oav } from '../../objectview/ObjectView';
import { SerializeProperty } from '../../serialization/SerializeProperty';
import { PerspectiveLens } from '../cameras/lenses/PerspectiveLens';
import { RegisterComponent } from '../../ecs/Component';
import { Node3D } from '../core/Node3D';
import { AddComponentMenu } from '../Menu';
import { createNodeMenu } from '../menu/CreateNodeMenu';
import { Light } from './Light';
import { LightType } from './LightType';

declare global
{
    export interface MixinsComponentMap
    {
        PointLight: PointLight;
    }

    export interface MixinsPrimitiveNode3D
    {
        'Point Light': Node3D;
    }
}

/**
 * 点光源
 */
@AddComponentMenu('Rendering/PointLight')
@RegisterComponent({ name: 'PointLight' })
export class PointLight extends Light
{
    declare __class__: 'PointLight';

    lightType = LightType.Point;

    /**
     * 光照范围
     */
    @oav()
    @SerializeProperty()
    get range()
    {
        return this._range;
    }
    set range(v)
    {
        if (this._range === v) return;
        this._range = v;
        this.invalidRange();
    }
    private _range = 10;

    /**
     * 阴影图尺寸
     */
    get shadowMapSize()
    {
        const { x, y } = this.shadowMap.getSize();

        return new Vector2(x / 4, y / 2);
    }

    constructor()
    {
        super();
        this.shadowCamera.lens = new PerspectiveLens(90, 1, 0.1, this.range);
    }

    private invalidRange()
    {
        if (this.shadowCamera)
        {
            this.shadowCamera.lens.far = this.range;
        }
    }
}

Node3D.registerPrimitive('Point Light', (g) =>
{
    g.addComponent(PointLight);
});

// 在 Hierarchy 界面新增右键菜单项
createNodeMenu.push(
    {
        path: 'Light/Point Light',
        priority: -1,
        click: () =>
            Node3D.createPrimitive('Point Light')
    }
);
