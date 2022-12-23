import { EventEmitter } from '../../event/EventEmitter';
import { oav } from '../../objectview/ObjectView';
import { Constructor } from '../../polyfill/Types';
import { serialize } from '../../serialization/serialize';
import { Component, Components } from '../component/Component';

export interface EntityEventMap
{
    /**
     * 添加子组件事件
     */
    addComponent: { entity: Entity, component: Component };

    /**
     * 移除子组件事件
     */
    removeComponent: { entity: Entity, component: Component };
}

/**
 * 实体
 *
 * `Entity`与`Component`构成`实体组件系统（ECS）`。
 */
export class Entity<T extends EntityEventMap = EntityEventMap> extends EventEmitter<T>
{
    /**
     * 名称
     */
    @serialize
    @oav({ priority: -2, component: 'OAVGameObjectName' })
    declare name: string;

    /**
     * 组件列表
     */
    @serialize
    @oav({ component: 'OAVComponentList' })
    get components()
    {
        return this._components.concat();
    }

    set components(value)
    {
        if (!value) return;
        for (let i = 0, n = value.length; i < n; i++)
        {
            const component = value[i];
            if (!component) continue;
            if (component.single) this.removeComponentsByType(<any>component.constructor);
            this.addComponentAt(value[i], this.numComponents);
        }
    }
    protected _components: Components[] = [];

    /**
     * 子组件个数
     */
    get numComponents()
    {
        return this._components.length;
    }

    /**
     * Adds a component class of type componentType to the game object.
     *
     * @param Type A component class of type.
     * @returns The component that is added.
     */
    /**
     * 添加一个类型为`type`的组件到游戏对象。
     *
     * @param Type 组件类定义。
     * @returns 被添加的组件。
     */
    addComponent<T extends Component>(Type: Constructor<T>): T
    {
        let component = this.getComponent(Type);
        if (component && Component.isSingleComponent(Type))
        {
            // alert(`The compnent ${param["name"]} can't be added because ${this.name} already contains the same component.`);
            return component;
        }
        const dependencies = Component.getDependencies(Type);
        // 先添加依赖
        dependencies.forEach((dependency) =>
        {
            this.addComponent(dependency);
        });
        //
        component = new Type();
        this.addComponentAt(component, this._components.length);

        return component;
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
        for (let i = 0; i < this._components.length; i++)
        {
            if (this._components[i] instanceof type)
            {
                return this._components[i] as T;
            }
        }

        return null;
    }

    /**
     * 返回Entity中指定类型的所有组件。
     *
     * @param type 要检索的组件类型。
     * @param results 列出接收找到的组件。
     * @returns Entity中指定类型的所有组件。
     */
    getComponents<T extends Component = Component>(type?: Constructor<T>, results: T[] = []): T[]
    {
        for (let i = 0; i < this._components.length; i++)
        {
            const component = this._components[i];
            if (!type || component instanceof type)
            {
                results.push(component as any);
            }
        }

        return results;
    }

    /**
     * 获取指定位置索引的子组件
     * @param index			位置索引
     * @return				子组件
     */
    getComponentAt(index: number): Component
    {
        console.assert(index < this.numComponents, '给出索引超出范围');

        return this._components[index];
    }

    /**
     * 设置子组件的位置
     * @param component				子组件
     * @param index				位置索引
     */
    setComponentIndex(component: Components, index: number): void
    {
        console.assert(index >= 0 && index < this.numComponents, '给出索引超出范围');

        const oldIndex = this._components.indexOf(component);
        console.assert(oldIndex >= 0 && oldIndex < this.numComponents, '子组件不在容器内');

        this._components.splice(oldIndex, 1);
        this._components.splice(index, 0, component);
    }

    /**
     * 设置组件到指定位置
     * @param component		被设置的组件
     * @param index			索引
     */
    setComponentAt(component: Components, index: number)
    {
        if (this._components[index])
        {
            this.removeComponentAt(index);
        }
        this.addComponentAt(component, index);
    }

    /**
     * 移除组件
     * @param component 被移除组件
     */
    removeComponent(component: Components): void
    {
        console.assert(this.hasComponent(component), '只能移除在容器中的组件');

        const index = this.getComponentIndex(component);
        this.removeComponentAt(index);
    }

    /**
     * 获取组件在容器的索引位置
     * @param component			查询的组件
     * @return				    组件在容器的索引位置
     */
    getComponentIndex(component: Components): number
    {
        console.assert(this._components.indexOf(component) !== -1, '组件不在容器中');

        const index = this._components.indexOf(component);

        return index;
    }

    /**
     * 移除组件
     * @param index		要删除的 Component 的子索引。
     */
    removeComponentAt(index: number): Component
    {
        console.assert(index >= 0 && index < this.numComponents, '给出索引超出范围');

        const component: Component = this._components.splice(index, 1)[0];
        // 派发移除组件事件
        this.emit('removeComponent', { component, entity: this as any }, true);
        component.dispose();

        return component;
    }

    /**
     * 交换子组件位置
     * @param index1		第一个子组件的索引位置
     * @param index2		第二个子组件的索引位置
     */
    swapComponentsAt(index1: number, index2: number): void
    {
        console.assert(index1 >= 0 && index1 < this.numComponents, '第一个子组件的索引位置超出范围');
        console.assert(index2 >= 0 && index2 < this.numComponents, '第二个子组件的索引位置超出范围');

        const temp: Components = this._components[index1];
        this._components[index1] = this._components[index2];
        this._components[index2] = temp;
    }

    /**
     * 交换子组件位置
     * @param a		第一个子组件
     * @param b		第二个子组件
     */
    swapComponents(a: Components, b: Components): void
    {
        console.assert(this.hasComponent(a), '第一个子组件不在容器中');
        console.assert(this.hasComponent(b), '第二个子组件不在容器中');

        this.swapComponentsAt(this.getComponentIndex(a), this.getComponentIndex(b));
    }

    /**
     * 移除指定类型组件
     * @param type 组件类型
     */
    removeComponentsByType<T extends Components>(type: Constructor<T>)
    {
        const removeComponents: T[] = [];
        for (let i = this._components.length - 1; i >= 0; i--)
        {
            if (this._components[i].constructor === type)
            { removeComponents.push(this.removeComponentAt(i) as T); }
        }

        return removeComponents;
    }

    /**
     * 判断是否拥有组件
     * @param com	被检测的组件
     * @return		true：拥有该组件；false：不拥有该组件。
     */
    private hasComponent(com: Components): boolean
    {
        return this._components.indexOf(com) !== -1;
    }

    /**
     * 添加组件到指定位置
     * @param component		被添加的组件
     * @param index			插入的位置
     */
    protected addComponentAt(component: Components, index: number): void
    {
        if (!component)
        { return; }
        console.assert(index >= 0 && index <= this.numComponents, '给出索引超出范围');

        if (this.hasComponent(component))
        {
            index = Math.min(index, this._components.length - 1);
            this.setComponentIndex(component, index);

            return;
        }
        // 组件唯一时移除同类型的组件
        if (component.single)
        { this.removeComponentsByType(<Constructor<Components>>component.constructor); }

        this._components.splice(index, 0, component);
        component.setObject3D(this as any);
        component.init();
        // 派发添加组件事件
        this.emit('addComponent', { component, entity: this as any }, true);
    }

    /**
     * 把事件分享到每个组件上。
     */
    getShareTargets()
    {
        return this.components;
    }

    /**
     * 销毁
     */
    dispose()
    {
        for (let i = this._components.length - 1; i >= 0; i--)
        {
            const compnent = this.removeComponentAt(i);
            compnent.dispose();
        }
        this._components = null;
        super.dispose();
    }
}
