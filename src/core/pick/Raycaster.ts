import { Ray3 } from '../../math/geom/Ray3';
import { Vector2 } from '../../math/geom/Vector2';
import { Vector3 } from '../../math/geom/Vector3';
import { CullFace } from '../../renderer/data/RenderParams';
import { Object3D } from '../core/Object3D';
import { Renderer } from '../core/Renderer';
import { Geometry } from '../geometry/Geometry';

/**
 * 射线投射拾取器
 */
export class Raycaster
{
    /**
     * 获取射线穿过的实体
     * @param ray3D 射线
     * @param object3Ds 实体列表
     * @return
     */
    pick(ray3D: Ray3, object3Ds: Object3D[])
    {
        if (object3Ds.length === 0) return null;

        const pickingCollisionVOs = object3Ds.reduce((pv: PickingCollisionVO[], object3D) =>
        {
            const model = object3D.getComponent(Renderer);
            const pickingCollisionVO = model && model.worldRayIntersection(ray3D);
            if (pickingCollisionVO) pv.push(pickingCollisionVO);

            return pv;
        }, []);

        if (pickingCollisionVOs.length === 0) return null;

        // 根据与包围盒距离进行排序
        pickingCollisionVOs.sort((a, b) => a.rayEntryDistance - b.rayEntryDistance);

        let shortestCollisionDistance = Number.MAX_VALUE;
        let bestCollisionVO: PickingCollisionVO = null;
        const collisionVOs: PickingCollisionVO[] = [];

        for (let i = 0; i < pickingCollisionVOs.length; ++i)
        {
            const pickingCollisionVO = pickingCollisionVOs[i];
            if (!bestCollisionVO || pickingCollisionVO.rayEntryDistance < bestCollisionVO.rayEntryDistance)
            {
                const result = pickingCollisionVO.geometry.raycast(pickingCollisionVO.localRay, shortestCollisionDistance, pickingCollisionVO.cullFace);
                if (result)
                {
                    pickingCollisionVO.rayEntryDistance = result.rayEntryDistance;
                    pickingCollisionVO.index = result.index;
                    pickingCollisionVO.localNormal = result.localNormal;
                    pickingCollisionVO.localPosition = result.localPosition;
                    pickingCollisionVO.uv = result.uv;
                    //
                    shortestCollisionDistance = pickingCollisionVO.rayEntryDistance;
                    collisionVOs.push(pickingCollisionVO);
                    bestCollisionVO = pickingCollisionVO;
                }
            }
        }

        return bestCollisionVO;
    }

    /**
     * 获取射线穿过的实体
     * @param ray3D 射线
     * @param object3Ds 实体列表
     * @return
     */
    pickAll(ray3D: Ray3, object3Ds: Object3D[])
    {
        if (object3Ds.length === 0) return [];

        const pickingCollisionVOs = object3Ds.reduce((pv: PickingCollisionVO[], object3D) =>
        {
            const model = object3D.getComponent(Renderer);
            const pickingCollisionVO = model && model.worldRayIntersection(ray3D);
            if (pickingCollisionVO) pv.push(pickingCollisionVO);

            return pv;
        }, []);

        if (pickingCollisionVOs.length === 0) return [];

        const collisionVOs = pickingCollisionVOs.filter((v) =>
        {
            const result = v.geometry.raycast(v.localRay, Number.MAX_VALUE, v.cullFace);
            if (result)
            {
                v.rayEntryDistance = result.rayEntryDistance;
                v.index = result.index;
                v.localNormal = result.localNormal;
                v.localPosition = result.localPosition;
                v.uv = result.uv;

                return true;
            }

            return false;
        });

        return collisionVOs;
    }
}

/**
 * 射线投射拾取器
 */
export const raycaster = new Raycaster();

/**
 * 拾取的碰撞数据
 */
export interface PickingCollisionVO
{
    /**
     * 第一个穿过的物体
     */
    object3D: Object3D;

    /**
     * 碰撞的uv坐标
     */
    uv?: Vector2;

    /**
     * 实体上碰撞本地坐标
     */
    localPosition?: Vector3;

    /**
     * 射线顶点到实体的距离
     */
    rayEntryDistance: number;

    /**
     * 本地坐标系射线
     */
    localRay: Ray3;

    /**
     * 本地坐标碰撞法线
     */
    localNormal: Vector3;

    /**
     * 射线坐标是否在边界内
     */
    rayOriginIsInsideBounds: boolean;

    /**
     * 碰撞三角形索引
     */
    index?: number;

    /**
     * 碰撞关联的渲染对象
     */
    geometry: Geometry;

    /**
     * 剔除面
     */
    cullFace: CullFace;
}
