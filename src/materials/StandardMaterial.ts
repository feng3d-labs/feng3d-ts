namespace feng3d
{
    /**
     * 标准材质
     * @author feng 2016-05-02
     */
    export class StandardMaterial extends Material
    {
        /**
         * 漫反射函数
         */
        @serialize()
        @oav()
        diffuseMethod = new DiffuseMethod();

        /**
         * 法线函数
         */
        @serialize()
        @oav()
        normalMethod = new NormalMethod();

        /**
         * 镜面反射函数
         */
        @serialize()
        @oav()
        specularMethod = new SpecularMethod();

        /**
         * 环境反射函数
         */
        @serialize()
        @oav()
        ambientMethod = new AmbientMethod();

        @serialize()
        @oav()
        envMapMethod = new EnvMapMethod();

        @serialize()
        @oav()
        fogMethod = new FogMethod();

        @serialize()
        @oav()
        terrainMethod = new TerrainMethod();
        // terrainMethod: TerrainMethod | TerrainMergeMethod;

        /**
         * 构建
         */
        constructor(diffuseUrl = "", normalUrl = "", specularUrl = "", ambientUrl = "")
        {
            super();
            this.shaderName = "standard";

            //
            this.diffuseMethod.difuseTexture.url = diffuseUrl;
            this.normalMethod.normalTexture.url = normalUrl;
            this.specularMethod.specularTexture.url = specularUrl;
            this.ambientMethod.ambientTexture.url = ambientUrl;
        }

        preRender(renderAtomic: RenderAtomic)
        {
            super.preRender(renderAtomic);

            this.diffuseMethod.preRender(renderAtomic);
            this.normalMethod.preRender(renderAtomic);
            this.specularMethod.preRender(renderAtomic);
            this.ambientMethod.preRender(renderAtomic);
            this.envMapMethod.preRender(renderAtomic);
            this.fogMethod.preRender(renderAtomic);
            this.terrainMethod.preRender(renderAtomic);
        }
    }
}