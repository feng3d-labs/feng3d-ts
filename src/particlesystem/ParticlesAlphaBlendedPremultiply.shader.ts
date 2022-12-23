import { Texture2D } from "../core/textures/Texture2D";
import { Vector4 } from "../math/geom/Vector4";
import { oav } from "../objectview/ObjectView";
import { shaderConfig } from "../renderer/shader/ShaderLib";
import { decoratorRegisterClass } from "../serialization/ClassUtils";
import { serialize } from "../serialization/serialize";

/**
 * UnityShader "Particles/Alpha Blended Premultiply"
 */
@decoratorRegisterClass()
export class ParticlesAlphaBlendedPremultiplyUniforms
{
    __class__: 'ParticlesAlphaBlendedPremultiplyUniforms';

    /**
     * 粒子贴图
     */
    @serialize
    @oav({ tooltip: '粒子贴图' })
    _MainTex = Texture2D.defaultParticle;

    /**
     * 粒子贴图使用的UV变换
     */
    @serialize
    @oav({ tooltip: '粒子贴图使用的UV变换' })
    _MainTex_ST = new Vector4(1, 1, 0, 0);

    /**
     * @todo
     */
    @serialize
    @oav()
    u_softParticlesFactor = 1.0;
}

shaderConfig.shaders['Particles_AlphaBlendedPremultiply'].cls = ParticlesAlphaBlendedPremultiplyUniforms;
shaderConfig.shaders['Particles_AlphaBlendedPremultiply'].renderParams = {
    enableBlend: true,
    sfactor: 'ONE',
    dfactor: 'ONE_MINUS_SRC_ALPHA',
    colorMask: [true, true, true, false],
    cullFace: 'NONE',
    depthMask: false,
};
