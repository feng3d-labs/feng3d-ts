namespace feng3d
{

    export interface UniformsMap { particle: ParticleUniforms }

    export class ParticleUniforms extends StandardUniforms
    {
        __class__: "feng3d.ParticleUniforms" = "feng3d.ParticleUniforms";
    }

    shaderConfig.shaders["particle"].cls = ParticleUniforms;

    Feng3dAssets.setAssets(Material.particle = new Material().value({ name: "Particle-Material", assetsId: "Particle-Material", shaderName: "particle", hideFlags: HideFlags.NotEditable }));
}