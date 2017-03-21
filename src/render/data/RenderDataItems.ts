module feng3d
{

	/**
	 * 索引渲染数据
     * @author feng 2017-01-04
	 */
    export class IndexRenderData
    {
        /**
         * 索引数据
         */
        public indices: Uint16Array;

        /**
         * 渲染数量
         */
        public count: number;

        /**
         * 数据类型，gl.UNSIGNED_BYTE、gl.UNSIGNED_SHORT
         */
        public type: number = GL.UNSIGNED_SHORT;

        /**
         * 索引偏移
         */
        public offset: number = 0;
        /**
         * 顶点缓冲
         */
        private _indexBufferMap = new Map<GL, WebGLBuffer>();
        /**
         * 是否失效
         */
        private _invalid = true;

        constructor()
        {
            Watcher.watch(this, ["indices"], this.invalidate, this);
        }

        /**
         * 使纹理失效
         */
        protected invalidate()
        {
            this._invalid = true;
            this.count = this.indices ? this.indices.length : 0;
        }

        /**
         * 激活顶点数据
         * @param gl 
         */
        public active(gl: GL)
        {
            if (this._invalid)
            {
                this.clear();
                this._invalid = false;
            }
            var buffer = this.getBuffer(gl);
            gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, buffer);
        }

        /**
         * 获取缓冲
         */
        private getBuffer(gl: GL)
        {
            var buffer = this._indexBufferMap.get(gl);
            if (!buffer)
            {
                buffer = gl.createBuffer();
                gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
                this._indexBufferMap.push(gl, buffer);
            }
            return buffer;
        }

        /**
         * 清理纹理
         */
        private clear()
        {
            var gls = this._indexBufferMap.getKeys();
            for (var i = 0; i < gls.length; i++)
            {
                gls[i].deleteBuffer(this._indexBufferMap.get(gls[i]))
            }
            this._indexBufferMap.clear();
        }

        /**
         * 克隆
         */
        public clone()
        {
            var cls = <any>this.constructor;
            var ins: this = new cls();
            var indices = ins.indices = new Uint16Array(this.indices.length);
            indices.set(this.indices, 0);
            ins.count = this.count;
            ins.type = this.type;
            ins.offset = this.offset;
            return ins;
        }
    }

	/**
	 * 属性渲染数据
	 * @author feng 2014-8-14
	 */
    export class AttributeRenderData
    {
        /**
         * 属性数据
         */
        data: Float32Array;

        /**
         * 数据步长
         */
        stride: number;

        /**
         * drawElementsInstanced时将会用到的因子，表示divisor个geometry共用一个数据
         */
        divisor: number;

        constructor(data: Float32Array = null, stride: number = 3, divisor: number = 0)
        {
            this.data = data;
            this.stride = stride;
            this.divisor = divisor;
        }
    }
}