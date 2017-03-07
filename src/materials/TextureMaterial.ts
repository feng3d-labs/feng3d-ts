module feng3d
{

    /**
     * 纹理材质
     * @author feng 2016-12-23
     */
    export class TextureMaterial extends Material
    {

        /**
         * 纹理数据
         */
        public texture: Texture2D;

        constructor()
        {
            super();
            this.shaderName = "texture";
        }

        /**
		 * 更新渲染数据
		 */
        public updateRenderData(renderContext: RenderContext)
        {
            super.updateRenderData(renderContext);

            this._renderData.uniforms[RenderDataID.s_texture] = this.texture;
        }
    }
}