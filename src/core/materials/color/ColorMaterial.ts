import { Color4 } from '../../../math/Color4';
import { oav } from '../../../objectview/ObjectView';
import { shaderlib } from '../../../renderer/shader/ShaderLib';
import { Serializable } from '../../../serialization/Serializable';
import { SerializeProperty } from '../../../serialization/SerializeProperty';
import { Material } from '../Material';
import colorFragment from './color_fragment_glsl';
import colorVertex from './color_vertex_glsl';

declare module '../Material'
{
    interface MaterialMap { color: ColorMaterial }

    interface DefaultMaterialMap { 'Color-Material': ColorMaterial; }
}

/**
 * 纯颜色材质
 */
@Serializable('ColorMaterial')
export class ColorMaterial extends Material
{
    declare __class__: 'ColorMaterial';

    uniforms = new ColorUniforms();

    constructor()
    {
        super();
        this.shader.shaderName = 'color';
    }
}

@Serializable('ColorUniforms')
export class ColorUniforms
{
    declare __class__: 'ColorUniforms';
    /**
     * 颜色
     */
    @SerializeProperty()
    @oav()
    u_diffuseInput = new Color4();
}

shaderlib.shaderConfig.shaders.color = {
    fragment: colorFragment,
    vertex: colorVertex,
};
