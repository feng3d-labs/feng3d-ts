import { Color4, Vector2, Vector3 } from '@feng3d/math';
import { oav } from '@feng3d/objectview';
import { decoratorRegisterClass, serialize } from '@feng3d/serialization';
import { watcher } from '@feng3d/watcher';
import { Geometry } from './Geometry';

declare global
{
    export interface MixinsGeometryTypes
    {
        PointGeometry: PointGeometry
    }
}

/**
 * 点几何体
 */
@decoratorRegisterClass()
export class PointGeometry extends Geometry
{
    __class__: 'PointGeometry';

    /**
     * 点数据列表
     * 修改数组内数据时需要手动调用 invalidateGeometry();
     */
    @serialize
    @oav()
    points: PointInfo[] = [];

    constructor()
    {
        super();
        watcher.watch(this as PointGeometry, 'points', this.invalidateGeometry, this);
    }

    /**
     * 构建几何体
     */
    buildGeometry()
    {
        let numPoints = this.points.length;
        const indices: number[] = [];
        const positionData: number[] = [];
        const normalData: number[] = [];
        const uvData: number[] = [];
        const colors: number[] = [];

        numPoints = Math.max(1, numPoints);

        for (let i = 0; i < numPoints; i++)
        {
            const element = this.points[i];
            const position = (element && element.position) || Vector3.ZERO;
            const color = (element && element.color) || Color4.WHITE;
            const normal = (element && element.normal) || Vector3.ZERO;
            const uv = (element && element.uv) || Vector2.ZERO;
            indices[i] = i;
            positionData.push(position.x, position.y, position.z);
            normalData.push(normal.x, normal.y, normal.z);
            uvData.push(uv.x, uv.y);
            colors.push(color.r, color.g, color.b, color.a);
        }
        this.attributes.a_position = { array: positionData, itemSize: 3 };
        this.attributes.a_uv = { array: uvData, itemSize: 2 };
        this.attributes.a_normal = { array: normalData, itemSize: 3 };
        this.attributes.a_color = { array: colors, itemSize: 4 };
        this.indexBuffer = { array: indices };
    }
}

/**
 * 点信息
 */
export interface PointInfo
{
    position?: Vector3;
    color?: Color4;
    normal?: Vector3;
    uv?: Vector2;
}