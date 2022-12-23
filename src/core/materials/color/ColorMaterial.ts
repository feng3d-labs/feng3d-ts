import { Color4 } from '../../../math/Color4';
import { oav } from '../../../objectview/ObjectView';
import { shaderlib } from '../../../renderer/shader/ShaderLib';
import { decoratorRegisterClass } from '../../../serialization/ClassUtils';
import { serialize } from '../../../serialization/Serialization';
import { Material } from '../Material';
import colorFragment from './color_fragment_glsl';
import colorVertex from './color_vertex_glsl';

declare global
{
    interface MixinsMaterialMap
    {
        color: ColorMaterial
    }

    export interface MixinsDefaultMaterial
    {
        'Color-Material': ColorMaterial;
    }
}

/**
 * 纯颜色材质
 */
@decoratorRegisterClass()
export class ColorMaterial extends Material
{
    __class__: 'ColorMaterial';

    uniforms = new ColorUniforms();

    constructor()
    {
        super();
        this.shader.shaderName = 'color';
    }
}

@decoratorRegisterClass()
export class ColorUniforms
{
    __class__: 'ColorUniforms';
    /**
     * 颜色
     */
    @serialize
    @oav()
    u_diffuseInput = new Color4();
}

shaderlib.shaderConfig.shaders.color = {
    fragment: colorFragment,
    vertex: colorVertex,
    cls: ColorUniforms
};
