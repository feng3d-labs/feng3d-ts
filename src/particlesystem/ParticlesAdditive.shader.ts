import { Material } from '../core/materials/Material';
import { Texture2D } from '../core/textures/Texture2D';
import { Color4 } from '../math/Color4';
import { Vector4 } from '../math/geom/Vector4';
import { oav } from '../objectview/ObjectView';
import { shaderConfig } from '../renderer/shader/ShaderLib';
import { Serializable } from '../serialization/Serializable';
import { SerializeProperty } from '../serialization/SerializeProperty';

declare global
{
    export interface MixinsUniformsTypes
    {
        Particles_Additive: ParticlesAdditiveUniforms
    }

    export interface MixinsDefaultMaterial
    {
        'Particle-Material': Material;
    }
}

@Serializable('ParticleMaterial')
export class ParticleMaterial extends Material
{
    uniforms = new ParticlesAdditiveUniforms();

    constructor()
    {
        super();
        this.shader.shaderName = 'Particles_Additive';
    }
}

/**
 * UnityShader "Particles/Additive"
 */
@Serializable('ParticlesAdditiveUniforms')
export class ParticlesAdditiveUniforms
{
    declare __class__: 'ParticlesAdditiveUniforms';

    @SerializeProperty()
    @oav()
    _TintColor = new Color4(0.5, 0.5, 0.5, 0.5);

    /**
     * 粒子贴图
     */
    @SerializeProperty()
    @oav({ tooltip: '粒子贴图' })
    _MainTex = Texture2D.defaultParticle;

    /**
     * 粒子贴图使用的UV变换
     */
    @SerializeProperty()
    @oav({ tooltip: '粒子贴图使用的UV变换' })
    _MainTex_ST = new Vector4(1, 1, 0, 0);

    /**
     * @todo
     */
    @SerializeProperty()
    @oav()
    _InvFade = 1.0;
}

shaderConfig.shaders['Particles_Additive'].cls = ParticlesAdditiveUniforms;
shaderConfig.shaders['Particles_Additive'].renderParams = {
    enableBlend: true,
    sfactor: 'SRC_ALPHA',
    dfactor: 'ONE',
    colorMask: [true, true, true, false],
    cullFace: 'NONE',
    depthMask: false,
};

Material.setDefault('Particle-Material', new ParticleMaterial());
