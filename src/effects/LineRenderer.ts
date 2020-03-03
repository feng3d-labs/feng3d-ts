namespace feng3d
{
    /**
     * The line renderer is used to draw free-floating lines in 3D space.
     * 
     * 线渲染器用于在三维空间中绘制自由浮动的线。
     */
    @AddComponentMenu("Effects/LineRenderer")
    export class LineRenderer extends Renderable
    {
        @oav({ exclude: true })
        geometry = new SegmentGeometry();

        @oav({ exclude: true })
        castShadows = false;

        @oav({ exclude: true })
        receiveShadows = false;

        /**
         * Select whether the line will face the camera, or the orientation of the Transform Component.
         * 
         * 选择线是否将面对摄像机，或转换组件的方向。
         */
        alignment

        /**
         * Set the color gradient describing the color of the line at various points along its length.
         * 
         * 设置颜色渐变，以描述线条沿其长度的各个点的颜色。
         */
        colorGradient

        /**
         * Set the color at the end of the line.
         * 
         * 设置线尾颜色。
         */
        endColor

        /**
         * Set the width at the end of the line.
         * 
         * 设置线尾宽度。
         */
        endWidth

        /**
         * Configures a line to generate Normals and Tangents. With this data, Scene lighting can affect the line via Normal Maps and the Unity Standard Shader, or your own custom-built Shaders.
         * 
         * 是否自动生成灯光所需的法线与切线。
         */
        generateLightingData

        /**
         * Connect the start and end positions of the line together to form a continuous loop.
         * 
         * 将直线的起点和终点连接在一起，形成一个连续的回路。
         */
        loop

        /**
         * Set this to a value greater than 0, to get rounded corners on each end of the line.
         * 
         * 将此值设置为大于0的值，以在行的两端获得圆角。
         */
        numCapVertices

        /**
         * Set this to a value greater than 0, to get rounded corners between each segment of the line.
         * 
         * 将此值设置为大于0的值，以在直线的每个线段之间获取圆角。
         */
        numCornerVertices

        /**
         * Set/get the number of vertices.
         * 
         * 设置/获取顶点数。
         */
        positionCount

        /**
         * Apply a shadow bias to prevent self-shadowing artifacts. The specified value is the proportion of the line width at each segment.
         * 
         * 应用阴影偏差以防止自阴影伪影。指定的值是每段线宽的比例。
         */
        shadowBias

        /**
         * Set the color at the start of the line.
         * 
         * 设置行线头颜色。
         */
        startColor

        /**
         * Set the width at the start of the line.
         * 
         * 设置线头宽度
         */
        startWidth

        /**
         * Choose whether the U coordinate of the line texture is tiled or stretched.
         * 
         * 选择是平铺还是拉伸线纹理的U坐标。
         */
        textureMode

        /**
         * If enabled, the lines are defined in world space.
         * 
         * 如果启用，则在世界空间中定义线。
         */
        useWorldSpace

        /**
         * Set the curve describing the width of the line at various points along its length.
         * 
         * 设置曲线，以描述沿线长度在各个点处的线宽。
         */
        widthCurve

        /**
         * Set an overall multiplier that is applied to the LineRenderer.widthCurve to get the final width of the line.
         * 
         * 设置一个应用于LineRenderer.widthCurve的总乘数，以获取线的最终宽度。
         */
        widthMultiplier

        /**
         * Creates a snapshot of LineRenderer and stores it in mesh.
         * 
         * 创建LineRenderer的快照并将其存储在网格中。
         */
        BakeMesh

        /**
         * Get the position of a vertex in the line.
         * 
         * 获取直线在顶点的位置。
         */
        GetPosition

        /**
         * Get the positions of all vertices in the line.
         * 
         * 获取行中所有顶点的位置。
         */
        GetPositions

        /**
         * Set the position of a vertex in the line.
         * 
         * 设置顶点在直线中的位置。
         */
        SetPosition

        /**
         * Set the positions of all vertices in the line.
         * 
         * 设置线中所有顶点的位置。
         */
        SetPositions

        /**
         * Generates a simplified version of the original line by removing points that fall within the specified tolerance.
         * 
         * 通过删除落在指定公差范围内的点，生成原始线的简化版本。
         */
        Simplify
    }
}