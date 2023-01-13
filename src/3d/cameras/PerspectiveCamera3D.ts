import { RegisterComponent } from '../../ecs/Component';
import { Vector3 } from '../../math/geom/Vector3';
import { Vector4 } from '../../math/geom/Vector4';
import { oav } from '../../objectview/ObjectView';
import { SerializeProperty } from '../../serialization/SerializeProperty';
import { watcher } from '../../watcher/watcher';
import { Camera3D } from './Camera3D';

declare module '../../ecs/Component' { interface ComponentMap { PerspectiveCamera3D: PerspectiveCamera3D; } }

/**
 * 透视摄像机
 */
@RegisterComponent({ name: 'PerspectiveCamera3D' })
export class PerspectiveCamera3D extends Camera3D
{
    /**
     * 垂直视角，视锥体顶面和底面间的夹角；单位为角度，取值范围 [1,179]
     */
    @SerializeProperty()
    @oav()
    fov = 60;

    init(): void
    {
        watcher.watch(this as PerspectiveCamera3D, 'fov', this._invalidateProjectionMatrix, this);
    }

    /**
     * 焦距
     */
    get focalLength(): number
    {
        return 1 / Math.tan(this.fov * Math.PI / 360);
    }

    set focalLength(value: number)
    {
        this.fov = Math.atan(1 / value) * 360 / Math.PI;
    }

    /**
     * 投影
     *
     * 摄像机空间坐标投影到GPU空间坐标
     *
     * @param point3d 摄像机空间坐标
     * @param v GPU空间坐标
     * @return GPU空间坐标
     */
    project(point3d: Vector3, v = new Vector3()): Vector3
    {
        const v4 = this.projectionMatrix.transformVector4(new Vector4().fromVector3(point3d, 1));
        // 透视投影结果中w!=1，需要标准化齐次坐标
        v.fromVector4(v4);
        v.scaleNumber(1 / v4.w);

        return v;
    }

    /**
     * 逆投影
     *
     * GPU空间坐标投影到摄像机空间坐标
     *
     * @param point3d GPU空间坐标
     * @param vOut 摄像机空间坐标（输出）
     * @returns 摄像机空间坐标
     */
    unproject(point3d: Vector3, vOut = new Vector3())
    {
        // ！！该计算过程需要参考或者研究透视投影矩阵
        // 初始化齐次坐标
        const p4 = new Vector4().fromVector3(point3d, 1);
        // 逆投影求出深度值
        const v4 = this.inversepPojectionMatrix.transformVector4(p4);
        const sZ = 1 / v4.w;
        // 齐次坐标乘以深度值获取真实的投影结果
        const p44 = p4.scaleNumberTo(sZ);
        // 计算逆投影
        const v44 = this.inversepPojectionMatrix.transformVector4(p44);
        // 输出3维坐标
        vOut.fromVector4(v44);

        return vOut;
    }

    protected _updateProjectionMatrix()
    {
        this._projectionMatrix.setPerspectiveFromFOV(this.fov, this.aspect, this.near, this.far);
    }
}
