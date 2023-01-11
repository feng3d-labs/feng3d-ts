import { RegisterComponent } from '../../ecs/Component';
import { Rectangle } from '../../math/geom/Rectangle';
import { Vector2 } from '../../math/geom/Vector2';
import { Vector3 } from '../../math/geom/Vector3';
import { WebGLRenderer } from '../../renderer/WebGLRenderer';
import { windowEventProxy } from '../../shortcut/WindowEventProxy';
import { Camera } from '../cameras/Camera';
import { forwardRenderer } from '../render/renderer/ForwardRenderer';
import { outlineRenderer } from '../render/renderer/OutlineRenderer';
import { shadowRenderer } from '../render/renderer/ShadowRenderer';
import { wireframeRenderer } from '../render/renderer/WireframeRenderer';
import { Scene } from '../scene/Scene';
import { skyboxRenderer } from '../skybox/SkyBoxRenderer';
import { ticker } from '../utils/Ticker';
import { Component3D } from './Component3D';
import { Node3D } from './Node3D';

declare module './Node3D'
{
    interface Node3DEventMap
    {
        /**
         * 渲染前事件，将在每次渲染前进行派发。
         *
         * 组件可以监听该事件，在渲染前更新渲染所需数据等。
         */
        beforeRender: BeforeRenderEventData;

        /**
         * 渲染后事件，将在每次渲染结束后进行派发。
         */
        afterRender: AfterRenderEventData;
    }
}

declare module '../../ecs/Component'
{
    interface ComponentMap { View3D: View3D; }
}

/**
 * 渲染后事件数据
 */
export interface AfterRenderEventData extends BeforeRenderEventData { }

/**
 * 渲染前事件数据
 */
export class BeforeRenderEventData
{
    /**
     *
     */
    view: View3D;

    /**
     * 渲染时将使用的摄像机。
     */
    camera: Camera;

    /**
     * 将被渲染的3D场景。
     */
    scene: Scene;

    /**
     * 画布。
     */
    canvas: HTMLCanvasElement;

    webGLRenderer: WebGLRenderer;

    /**
     * 视窗（canvas）所在页面显示区域。
     */
    viewRect: Rectangle;

    /**
     * 鼠标所在画布中的位置
     */
    mousePos: Vector2;

    constructor(view: View3D, canvas: HTMLCanvasElement, camera: Camera, scene: Scene, webGLRenderer)
    {
        this.view = view;
        this.canvas = canvas;
        this.camera = camera;
        this.scene = scene;
        this.webGLRenderer = webGLRenderer;

        // 计算视窗区域
        const clientRect = this.canvas.getBoundingClientRect();
        this.viewRect = new Rectangle(clientRect.x, clientRect.y, clientRect.width, clientRect.height);

        // 更新摄像机宽高比
        camera.lens.aspect = clientRect.width / clientRect.height;

        // 计算鼠标所在画布中的位置
        this.mousePos = new Vector2(windowEventProxy.clientX - clientRect.left, windowEventProxy.clientX - clientRect.left);
    }

    /**
     * 屏幕坐标转GPU坐标
     * @param screenPos 屏幕坐标 (x: [0-width], y: [0 - height])
     * @return GPU坐标 (x: [-1, 1], y: [-1, 1])
     */
    screenToGpuPosition(screenPos: Vector2): Vector2
    {
        const gpuPos: Vector2 = new Vector2();
        gpuPos.x = (screenPos.x * 2 - this.viewRect.width) / this.viewRect.width;
        // 屏幕坐标与gpu中使用的坐标Y轴方向相反
        gpuPos.y = -(screenPos.y * 2 - this.viewRect.height) / this.viewRect.height;

        return gpuPos;
    }

    /**
     * 投影坐标（世界坐标转换为3D视图坐标）
     * @param point3d 世界坐标
     * @return 屏幕的绝对坐标
     */
    project(point3d: Vector3): Vector3
    {
        const v: Vector3 = this.camera.project(point3d);
        v.x = (v.x + 1.0) * this.viewRect.width / 2.0;
        v.y = (1.0 - v.y) * this.viewRect.height / 2.0;

        return v;
    }

    /**
     * 屏幕坐标投影到场景坐标
     * @param nX 屏幕坐标X ([0-width])
     * @param nY 屏幕坐标Y ([0-height])
     * @param sZ 到屏幕的距离
     * @param v 场景坐标（输出）
     * @return 场景坐标
     */
    unproject(sX: number, sY: number, sZ: number, v = new Vector3()): Vector3
    {
        const gpuPos: Vector2 = this.screenToGpuPosition(new Vector2(sX, sY));

        return this.camera.unproject(gpuPos.x, gpuPos.y, sZ, v);
    }

    /**
     * 获取单位像素在指定深度映射的大小
     * @param   depth   深度
     */
    getScaleByDepth(depth: number, dir = new Vector2(0, 1))
    {
        let scale = this.camera.getScaleByDepth(depth, dir);
        scale = scale / new Vector2(this.viewRect.width * dir.x, this.viewRect.height * dir.y).length;

        return scale;
    }

    /**
     * 获取鼠标射线（与鼠标重叠的摄像机射线）
     */
    getMouseRay3D()
    {
        const gpuPos = this.screenToGpuPosition(this.mousePos);

        const ray = this.camera.getRay3D(gpuPos.x, gpuPos.y);

        return ray;
    }

    /**
     * 获取屏幕区域内所有游戏对象
     * @param start 起点
     * @param end 终点
     */
    getObjectsInGlobalArea(start: Vector2, end: Vector2)
    {
        const s = this.viewRect.clampPoint(start);
        const e = this.viewRect.clampPoint(end);
        s.sub(this.viewRect.topLeft);
        e.sub(this.viewRect.topLeft);
        const min = s.clone().min(e);
        const max = s.clone().max(e);
        const rect = new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
        //
        let node3ds = this.scene.node3d.traverse((node3d: Node3D) =>
        {
            if (node3d === this.scene.entity) return;

            return node3d;
        });

        node3ds = node3ds.filter((node3d) =>
        {
            if (!node3d) return false;

            const m = node3d.getComponent('MeshRenderer');
            if (m)
            {
                const include = m.selfWorldBounds.toPoints().every((pos) =>
                {
                    const p = this.project(pos);

                    return rect.contains(p.x, p.y);
                });

                return include;
            }
            const p = this.project(node3d.worldPosition);

            return rect.contains(p.x, p.y);
        });

        return node3ds;
    }
}

/**
 * 视图
 */
@RegisterComponent({ name: 'View3D' })
export class View3D extends Component3D
{
    /**
     * 将被绘制的目标画布。
     */
    get canvas()
    {
        if (!this._canvas)
        {
            const canvas = document.createElement('canvas');
            canvas.id = 'glcanvas';
            canvas.style.position = 'fixed';
            canvas.style.left = '0px';
            canvas.style.top = '0px';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            document.body.appendChild(canvas);
            this.canvas = canvas;
        }

        return this._canvas;
    }
    set canvas(v)
    {
        if (this._canvas)
        {
            this._canvas.removeEventListener('webglcontextlost', this._onContextLost, false);
            this._canvas.removeEventListener('webglcontextrestored', this._onContextRestore, false);
            this._canvas.removeEventListener('webglcontextcreationerror', this._onContextCreationError, false);
        }
        this._canvas = v;
        if (this._canvas)
        {
            this._canvas.addEventListener('webglcontextlost', this._onContextLost, false);
            this._canvas.addEventListener('webglcontextrestored', this._onContextRestore, false);
            this._canvas.addEventListener('webglcontextcreationerror', this._onContextCreationError, false);
        }
    }
    private _canvas: HTMLCanvasElement;

    contextAttributes: WebGLContextAttributes = { stencil: true, antialias: true };

    /**
     * 渲染时使用的摄像机。
     *
     * 如果值为undefined时，从自身与子结点中获取到 Camera 组件。默认为undefined。
     */
    camera: Camera;

    /**
     * 当前渲染时将使用的 Camera 。
     */
    getRenderCamera()
    {
        let camera = this.camera;
        if (!camera)
        {
            camera = this.getComponentInChildren('Camera');
        }

        return camera;
    }

    /**
     * 当前渲染时将使用的 Scene 。
     */
    getRenderScene()
    {
        let scene = this.scene;
        if (!scene)
        {
            scene = this.getComponentInChildren('Scene');
        }

        return scene;
    }

    /**
     * 将要渲染的3D场景。
     *
     * 如果值为undefined时，从自身与子结点中获取到 Scene 组件。默认为undefined。
     */
    scene: Scene;

    /**
     * 根结点
     */
    get root()
    {
        return this.scene.node3d;
    }

    get gl()
    {
        if (!this._gl)
        {
            const canvas = this.canvas;

            const contextAttributes = Object.assign({
                depth: true,
                stencil: true,
                antialias: false,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
            } as Partial<WebGLContextAttributes>, this.contextAttributes);

            const contextNames = ['webgl2', 'webgl', 'experimental-webgl'];
            this.gl = getContext(canvas, contextNames, contextAttributes) as WebGLRenderingContext;
        }

        return this._gl;
    }
    set gl(v)
    {
        this._gl = v;
        if (this._webGLRenderer)
        {
            this._webGLRenderer.gl = this._gl;
        }
    }
    private _gl: WebGLRenderingContext;

    get webGLRenderer()
    {
        if (!this._webGLRenderer)
        {
            this._webGLRenderer = new WebGLRenderer();
            this._webGLRenderer.gl = this.gl;
        }

        return this._webGLRenderer;
    }
    private _webGLRenderer: WebGLRenderer;

    /**
     * 是否自动调用 render() 渲染。
     *
     * 默认为true。
     */
    get isAutoRender()
    {
        return this._isAutoRender;
    }
    set isAutoRender(v)
    {
        if (this._isAutoRender)
        {
            ticker.offFrame(this.render, this);
        }
        this._isAutoRender = v;
        if (this._isAutoRender)
        {
            ticker.onFrame(this.render, this);
        }
    }
    private _isAutoRender: boolean;

    init(): void
    {
        this.isAutoRender = true;
    }

    /**
     * 绘制场景
     */
    render(_interval?: number)
    {
        if (this._isContextLost === true) return;

        const camera = this.getRenderCamera();
        if (!camera)
        {
            console.warn(`无法从自身与子结点中获取到 Camera 组件，无法渲染！`);

            return;
        }
        const scene = this.getRenderScene();
        if (!scene)
        {
            console.warn(`无法从自身与子结点中获取到 Scene 组件，无法渲染！`);

            return;
        }

        const canvas = this.canvas;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        if (canvas.width * canvas.height === 0) return;

        const webGLRenderer = this.webGLRenderer;

        const data = new BeforeRenderEventData(this, canvas, camera, scene, webGLRenderer);

        //
        this.emitter.emit('beforeRender', data, true, true);

        const gl = this.gl;
        // 默认渲染
        gl.colorMask(true, true, true, true);
        gl.clearColor(scene.background.r, scene.background.g, scene.background.b, scene.background.a);
        gl.clearStencil(0);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        // 绘制阴影图
        shadowRenderer.draw(webGLRenderer, scene, camera);
        skyboxRenderer.draw(webGLRenderer, scene, camera);
        // 默认渲染
        forwardRenderer.draw(webGLRenderer, scene, camera);
        outlineRenderer.draw(webGLRenderer, scene, camera);
        wireframeRenderer.draw(webGLRenderer, scene, camera);

        // 派发渲染后事件
        this.emitter.emit('afterRender', data, true, true);
    }

    private _isContextLost = false;
    private _onContextLost = (event: Event) =>
    {
        event.preventDefault();

        console.warn('WebGLRenderer: Context Lost.');

        this._isContextLost = true;
    };

    private _onContextRestore = () =>
    {
        console.warn('WebGLRenderer: Context Restored.');

        this._isContextLost = false;

        this.webGLRenderer.init();
    };

    private _onContextCreationError = (event: WebGLContextEvent) =>
    {
        console.error('WebGLRenderer: A WebGL context could not be created. Reason: ', event.statusMessage);
    };
}

function getContext(canvas: HTMLCanvasElement, contextNames: string[], contextAttributes?: Partial<WebGLContextAttributes>)
{
    const context = _getContext(canvas, contextNames, contextAttributes);

    if (!context)
    {
        if (_getContext(canvas, contextNames))
        {
            throw new Error('Error creating WebGL context with your selected attributes.');
        }
        else
        {
            throw new Error('Error creating WebGL context.');
        }
    }

    return context;
}

function _getContext(canvas: HTMLCanvasElement, contextNames: string[], contextAttributes?: Partial<WebGLContextAttributes>)
{
    let context: RenderingContext;
    for (let i = 0; i < contextNames.length; ++i)
    {
        context = canvas.getContext(contextNames[i], contextAttributes);
        if (context) return context;
    }

    return null;
}
