module feng3d
{

    /**
     * 渲染数据编号
     * @author feng 2016-06-20
     */
    export class RenderDataID
    {

        /**
         * 顶点索引
         */
        public static index = "index";

        /**
         * 模型矩阵
         */
        public static u_modelMatrix = "u_modelMatrix";

        /**
         * 世界投影矩阵
         */
        public static u_viewProjection = "u_viewProjection";

        public static u_diffuseInput = "u_diffuseInput";

        /**
         * 漫反射贴图
         */
        public static s_texture = "s_texture";
        /**
         * 天空盒纹理
         */
        public static s_skyboxTexture = "s_skyboxTexture";

        /**
         * 摄像机矩阵
         */
        public static u_cameraMatrix = "u_cameraMatrix";
        /**
         * 天空盒尺寸
         */
        public static u_skyBoxSize = "u_skyBoxSize";

        /**
         * 地形混合贴图
         */
        public static s_blendTexture = "s_blendTexture";

        /**
         * 地形块贴图1
         */
        public static s_splatTexture1 = "s_splatTexture1";
        /**
         * 地形块贴图2
         */
        public static s_splatTexture2 = "s_splatTexture2";
        /**
         * 地形块贴图3
         */
        public static s_splatTexture3 = "s_splatTexture3";
        /**
         * 地形块重复次数
         */
        public static u_splatRepeats = "u_splatRepeats";
        /**
         * 点光源位置数组
         */
        public static u_pointLightPositions = "u_pointLightPositions";
        /**
         * 点光源颜色数组
         */
        public static u_pointLightColors = "u_pointLightColors";
        /**
         * 点光源光照强度数组
         */
        public static u_pointLightIntensitys = "u_pointLightIntensitys";

        /**
         * 基本颜色
         */
        public static u_baseColor = "u_baseColor";

        /**
         * 反射率
         */
        public static u_reflectance = "u_reflectance";

        /**
         * 粗糙度
         */
        public static u_roughness = "u_roughness";

        /**
         * 金属度
         */
        public static u_metalic = "u_metalic";

        /**
         * 粒子时间
         */
        public static u_particleTime = "u_particleTime";

        /**
         * 点大小
         */
        public static u_PointSize = "u_PointSize";

        /**
         * 骨骼全局矩阵
         */
        public static u_skeletonGlobalMatriices = "u_skeletonGlobalMatriices";

        /**
         * 3D对象编号
         */
        public static u_objectID = "u_objectID";
    }
}