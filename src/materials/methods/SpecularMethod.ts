namespace feng3d
{
	/**
	 * 法线函数
	 * @author feng 2017-03-22
	 */
    export class SpecularMethod extends RenderDataHolder
    {
        /**
         * 镜面反射光泽图
         */
        @serialize
        get specularTexture()
        {
            return this._specularTexture;
        }
        set specularTexture(value)
        {
            this._specularTexture = value;
        }
        private _specularTexture: Texture2D;
        /**
         * 镜面反射颜色
         */
        @serialize
        specularColor = new Color();
        /**
		 * 镜面反射光反射强度
		 */
        @serialize
        get specular()
        {
            return this.specularColor.a;
        }
        set specular(value)
        {
            this.specularColor.a = value;
        }
        /**
         * 高光系数
         */
        @serialize
        glossiness = 50;

        /**
         * 构建
         */
        constructor(specularUrl = "")
        {
            super();
            this.specularTexture = new Texture2D(specularUrl);
            //
            this.createUniformData("s_specular", () => this.specularTexture);
            this.createUniformData("u_specular", () => this.specularColor);
            this.createUniformData("u_glossiness", () => this.glossiness);
            this.createBoolMacro("HAS_SPECULAR_SAMPLER", () => this.specularTexture.checkRenderData());
        }
    }
}