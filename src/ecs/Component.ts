import { Camera } from '../core/cameras/Camera';
import { HideFlags } from '../core/core/HideFlags';
import { Object3D, Object3DEventMap } from '../core/core/Object3D';
import { Scene } from '../core/scene/Scene';
import { EventEmitter } from '../event/EventEmitter';
import { Constructor } from '../polyfill/Types';
import { RenderAtomic } from '../renderer/data/RenderAtomic';
import { SerializeProperty } from '../serialization/SerializeProperty';

declare global
{
    interface MixinsComponentMap { }
}

interface ComponentInfo
{
    /**
     * 组件名称，默认构造函数名称。当组件重名时可以使用该参数进行取别名，并且在接口 ComponentMap 中相应调整。
     */
    name: string;
    /**
     * 是否唯一，同类型组件只允许一个。
     */
    single: boolean;
    /**
     * 构造函数
     */
    type: Constructor<Component>;
    /**
     * 所依赖的组件列表。当该组件被添加Entity上时，会补齐缺少的依赖组件。
     */
    dependencies: Constructor<Component>[];
}

/**
 * 组件信息属性常量，保存组件名称与组件依赖ComponentInfo，由 @RegisterComponent 装饰器进行填充。
 */
const __component__ = '__component__';

/**
 * 注册组件
 *
 * 使用 @RegisterComponent 在组件类定义上注册组件，配合扩展 ComponentMap 接口后可使用 Entity.getComponent 等方法。
 *
 * @param component 组件名称，默认使用类名称
 */
export function RegisterComponent(component?: {
    /**
     * 组件名称，默认构造函数名称。当组件重名时可以使用该参数进行取别名，并且在接口 ComponentMap 中相应调整。
     */
    name: string,
    /**
     * 是否唯一，同类型组件只允许一个。
     */
    single?: boolean,
    /**
     * 所依赖的组件列表。当该组件被添加Entity上时，会补齐缺少的依赖组件。
     */
    dependencies?: Constructor<Component>[]
})
{
    return (constructor: Constructor<Component>) =>
    {
        component = component || <any>{};
        const info = component as ComponentInfo;
        info.name = info.name || component.name || constructor.name;
        info.type = constructor;
        info.dependencies = info.dependencies || [];
        constructor.prototype[__component__] = info;

        if (Component._componentMap[info.name])
        {
            console.warn(`重复定义组件${info.name}，${Component._componentMap[info.name]} ${constructor} ！`);
        }
        else
        {
            Component._componentMap[info.name] = constructor;
        }
    };
}

export function getComponentType<T extends ComponentNames>(type: T): Constructor<ComponentMap[T]>
{
    return Component._componentMap[type] as any;
}

/**
 * 组件名称与类定义映射，由 @RegisterComponent 装饰器进行填充。
 */
export const componentMap: ComponentMap = <any>{};

/**
 * 组件名称与类定义映射，新建组件一般都需扩展该接口。
 */
export interface ComponentMap extends MixinsComponentMap { Component: Component }

export type ComponentNames = keyof ComponentMap;
export type Components = ComponentMap[ComponentNames];

/**
 * 组件
 *
 * 所有附加到Object3Ds的基类。
 *
 * 注意，您的代码永远不会直接创建组件。相反，你可以编写脚本代码，并将脚本附加到Object3D(游戏物体)上。
 */
export class Component extends EventEmitter<Object3DEventMap>
{
    /**
     * 隐藏标记，用于控制是否在层级界面、检查器显示，是否保存
     */
    @SerializeProperty()
    hideFlags = HideFlags.None;

    // ------------------------------------------
    // Variables
    // ------------------------------------------
    /**
     * 此组件附加到的游戏对象。组件总是附加到游戏对象上。
     */
    get object3D()
    {
        return this._object3D;
    }

    /**
     * 标签
     */
    get tag()
    {
        return this._object3D.tag;
    }

    /**
     * 是否唯一，同类型3D对象组件只允许一个
     */
    get single()
    {
        return false;
    }

    // ------------------------------------------
    // Functions
    // ------------------------------------------
    /**
     * 创建一个组件
     */
    constructor()
    {
        super();
    }

    /**
     * 初始化组件
     *
     * 在添加到Object3D时立即被调用。
     */
    init()
    {
    }

    /**
     * Adds a component class of type componentType to the game object.
     *
     * @param type A component class of type.
     * @returns The component that is added.
     */
    /**
     * Adds a component class of type componentType to the game object.
     *
     * @param type 组件类定义。
     * @returns 被添加的组件。
     */
    addComponent<T extends Component>(type: Constructor<T>): T
    {
        return this._object3D.addComponent(type);
    }

    /**
     * 返回游戏对象附加的一个指定类型的组件，如果没有，则返回 null。
     *
     * 使用 Entity.GetComponent 将返回找到的第一个组件。如果您希望有多个相同类型的组件，请改用 Entity.GetComponents，并循环通过返回的组件测试某些唯一属性。
     *
     * @param type 要检索的组件类型。
     * @returns 要检索的组件。
     */
    getComponent<T extends Component>(type: Constructor<T>): T
    {
        return this._object3D.getComponent(type);
    }

    /**
     * 使用深度优先搜索返回 Entity 或其任何子项中的 Type 组件。
     *
     * @param type 要检索的组件类型。
     * @param includeInactive 是否包含不活跃组件。
     * @returns 匹配类型的组件（如果找到）。
     */
    getComponentInChildren<T extends Component>(type: Constructor<T>, includeInactive = false): T
    {
        return this._object3D.getComponentInChildren(type, includeInactive);
    }

    /**
     * 检索 Entity 或其任何父项type中的 Type 组件。
     *
     * 此方法向上递归，直到找到具有匹配组件的 Entity。仅匹配活动游戏对象上的组件。
     *
     * @param type 要查找的组件类型。
     * @param includeInactive 是否包含不活跃组件。
     * @returns 如果找到与类型匹配的组件，则返回一个组件。否则返回 null。
     */
    getComponentInParent<T extends Component>(type: Constructor<T>, includeInactive = false): T
    {
        return this._object3D.getComponentInParent(type, includeInactive);
    }

    /**
     * 返回Entity中指定类型的所有组件。
     *
     * @param type 要检索的组件类型。
     * @param results 列出接收找到的组件。
     * @returns 实体中指定类型的所有组件。
     */
    getComponents<T extends Component>(type: Constructor<T>, results: T[] = []): T[]
    {
        return this._object3D.getComponents(type, results);
    }

    /**
     * 使用深度优先搜索返回 当前实体 或其任何子子项中 Type 的所有组件。递归工作。
     *
     * 在子游戏对象上递归搜索组件。这意味着它还包括目标实体的所有子实体，以及所有后续子实体。
     *
     * @param type 要检索的组件类型。
     * @param includeInactive 非活动游戏对象上的组件是否应该包含在搜索结果中？
     * @param results 列出接收找到的组件。
     * @returns 所有找到的组件。
     */
    getComponentsInChildren<T extends Component>(type: Constructor<T>, includeInactive = false, results: T[] = []): T[]
    {
        return this._object3D.getComponentsInChildren(type, includeInactive, results);
    }

    /**
     * 返回当前实体或其任何父级中指定的所有组件。
     *
     * @param type 要检索的组件类型。
     * @param includeInactive 非活动组件是否应该包含在搜索结果中？
     * @param results 列出找到的组件。
     * @returns 实体或其任何父级中指定的所有组件。
     */
    getComponentsInParent<T extends Component>(type: Constructor<T>, includeInactive = false, results: T[] = []): T[]
    {
        return this._object3D.getComponentsInParent(type, includeInactive, results);
    }

    /**
     * 把事件分享到实体上。
     */
    getShareTargets()
    {
        return [this._object3D];
    }

    /**
     * 销毁
     */
    dispose()
    {
        this._object3D = <any>null;
    }

    beforeRender(_renderAtomic: RenderAtomic, _scene: Scene, _camera: Camera)
    {

    }

    /**
     * 该方法仅在Entity中使用
     * @private
     *
     * @param object3D 游戏对象
     */
    setObject3D(object3D: Object3D)
    {
        this._object3D = object3D;
    }
    protected _object3D: Object3D;

    /**
     * 组件名称与类定义映射，由 @RegisterComponent 装饰器进行填充。
     * @private
     */
    static _componentMap: { [name: string]: Constructor<Component> } = {};

    /**
     * 获取组件依赖列表
     *
     * @param type 组件类定义
     */
    static getDependencies(type: Constructor<Component>)
    {
        let prototype = type.prototype;
        let dependencies: Constructor<Component>[] = [];
        while (prototype)
        {
            dependencies = dependencies.concat((prototype[__component__] as ComponentInfo)?.dependencies || []);
            prototype = prototype.__proto__;
        }

        return dependencies;
    }

    /**
     * 判断组件是否为唯一组件。
     *
     * @param type 组件类定义
     */
    static isSingleComponent<T extends Component>(type: Constructor<T>)
    {
        let prototype = type.prototype;
        let isSingle = false;
        while (prototype && !isSingle)
        {
            isSingle = !!((prototype[__component__] as ComponentInfo)?.single);
            prototype = prototype.__proto__;
        }

        return isSingle;
    }
}
