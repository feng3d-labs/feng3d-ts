namespace feng3d
{

    /**
     * 着色器宏定义
     */
    export interface ShaderMacro
    {

        /**
         * 光源数量
         */
        NUM_LIGHT: number;

        /** 
         * 点光源数量
         */
        NUM_POINTLIGHT: number;

        /** 
         * 方向光源数量
         */
        NUM_DIRECTIONALLIGHT: number;

        /**
         * 骨骼关节数量
         */
        NUM_SKELETONJOINT: number;

        /**
         * 是否有漫反射贴图
         */
        HAS_DIFFUSE_SAMPLER: boolean;
        /**
         * 是否有法线贴图
         */
        HAS_NORMAL_SAMPLER: boolean;
        /**
         * 是否有镜面反射光泽图
         */
        HAS_SPECULAR_SAMPLER: boolean;
        /**
         * 是否有环境贴图
         */
        HAS_AMBIENT_SAMPLER: boolean;
        /**
         * 是否有骨骼动画
         */
        HAS_SKELETON_ANIMATION: boolean;
        /**
         * 是否有粒子动画
         */
        HAS_PARTICLE_ANIMATOR: boolean;
        /**
         * 是否为点渲染模式
         */
        IS_POINTS_MODE: boolean;
        /**
         * 是否有地形方法
         */
        HAS_TERRAIN_METHOD: boolean;
        /**
         * 使用合并地形贴图
         */
        USE_TERRAIN_MERGE: boolean;
        /**
         * 雾函数
         */
        HAS_FOG_METHOD: boolean;
        /**
         * 环境映射函数
         */
        HAS_ENV_METHOD: boolean;

        /** 
         * 是否需要变量全局坐标
         */
        GLOBAL_POSITION_NEED: number;
        /**
         * 是否需要属性法线
         */
        A_NORMAL_NEED: number;
        /**
         * 是否需要变量法线
         */
        V_NORMAL_NEED: number;
        /**
         * 是否需要摄像机矩阵
         */
        U_CAMERAMATRIX_NEED: number;



        /**
         * 是否卡通渲染
         */
        IS_CARTOON: Boolean;
        /**
         * 是否抗锯齿
         */
        cartoon_Anti_aliasing: Boolean;
    }
}