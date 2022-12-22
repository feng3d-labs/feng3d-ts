import { EventEmitter, globalEmitter } from '@feng3d/event';
import { oav } from '@feng3d/objectview';
import { gPartial } from '@feng3d/polyfill';
import { RenderAtomic, RenderParams, Shader, Uniforms } from '@feng3d/renderer';
import { serialization, serialize } from '@feng3d/serialization';
import { AssetData } from '../core/AssetData';
import { Texture2D } from '../textures/Texture2D';
import { TextureCube } from '../textures/TextureCube';

declare global
{
    interface MixinsDefaultMaterial
    {

    }
    interface MixinsMaterialMap
    {

    }
}

export interface MaterialMap extends MixinsMaterialMap { }
export type MaterialNames = keyof MaterialMap;
export type Materials = MaterialMap[keyof MaterialMap];

/**
 * 材质
 */
export abstract class Material extends EventEmitter
{
    init(param: gPartial<this>)
    {
        serialization.setValue(this, param);
        return this;
    }

    @oav({ component: 'OAVFeng3dPreView' })
    private preview = '';

    /**
     * shader名称
     */
    @oav({ component: 'OAVMaterialName' })
    get shaderName()
    {
        return this.shader.shaderName;
    }

    @oav()
    @serialize
    name = '';

    /**
     * Uniform数据
     */
    @serialize
    @oav({ component: 'OAVObjectView' })
    uniforms = {};

    /**
     * 渲染参数
     */
    @serialize
    @oav({ block: '渲染参数', component: 'OAVObjectView' })
    renderParams = new RenderParams();

    @serialize
    shader = new Shader();

    constructor(param?: gPartial<Material>)
    {
        super();
        serialization.setValue(this, param);
        console.assert(this.constructor.name !== 'Material', `无法之间构建 Material`)
    }

    beforeRender(renderAtomic: RenderAtomic)
    {
        Object.assign(renderAtomic.uniforms, this.uniforms);

        renderAtomic.shader = this.shader;
        renderAtomic.renderParams = this.renderParams;
        renderAtomic.shaderMacro.IS_POINTS_MODE = this.renderParams.renderMode === 'POINTS';
    }

    /**
     * 是否加载完成
     */
    get isLoaded()
    {
        const uniforms = this.uniforms;
        for (const key in uniforms)
        {
            const texture = uniforms[key];
            if (texture instanceof Texture2D || texture instanceof TextureCube)
            {
                if (!texture.isLoaded) return false;
            }
        }

        return true;
    }

    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    onLoadCompleted(callback: () => void)
    {
        let loadingNum = 0;
        const uniforms = this.uniforms;
        for (const key in uniforms)
        {
            const texture = uniforms[key];
            if (texture instanceof Texture2D || texture instanceof TextureCube)
            {
                if (!texture.isLoaded)
                {
                    loadingNum++;
                    // eslint-disable-next-line no-loop-func
                    texture.on('loadCompleted', () =>
                    {
                        loadingNum--;
                        if (loadingNum === 0) callback();
                    });
                }
            }
        }
        if (loadingNum === 0) callback();
    }

    /**
     * 设置默认材质
     *
     * 资源名称与材质名称相同，且无法在检查器界面中编辑。
     *
     * @param name 材质名称
     * @param material 材质数据
     */
    static setDefault<K extends keyof DefaultMaterial>(name: K, material: Material)
    {
        this._defaultMaterials[<any>name] = material;
        material.name = name;
        AssetData.addAssetData(name, material);
    }

    /**
     * 获取材质
     *
     * @param name 材质名称
     */
    static getDefault<K extends keyof DefaultMaterial>(name: K)
    {
        return this._defaultMaterials[name];
    }
    private static _defaultMaterials: DefaultMaterial = <any>{};
}

/**
 * 默认材质
 */
export interface DefaultMaterial extends MixinsDefaultMaterial
{
}

