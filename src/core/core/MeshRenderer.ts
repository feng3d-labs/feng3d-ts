import { decoratorRegisterClass } from '../../serialization/ClassUtils';
import { RegisterComponent } from '../component/Component';
import { Renderable } from './Renderable';

declare global
{
    export interface MixinsComponentMap { MeshRenderer: MeshRenderer }
}

/**
 * 网格渲染器
 */
@RegisterComponent()
@decoratorRegisterClass()
export class MeshRenderer extends Renderable
{
    __class__: 'MeshRenderer';
}
