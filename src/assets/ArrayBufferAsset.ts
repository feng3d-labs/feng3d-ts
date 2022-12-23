import { FileAsset } from "../core/assets/FileAsset";
import { decoratorRegisterClass } from "../serialization/ClassUtils";

/**
 * 二进制 资源
 */
@decoratorRegisterClass()
export class ArrayBufferAsset extends FileAsset
{
    /**
     * 文件数据
     */
    arraybuffer: ArrayBuffer;

    /**
     * 保存文件
     */
    async saveFile()
    {
        await this.rs.fs.writeArrayBuffer(this.assetPath, this.arraybuffer);
    }

    /**
     * 读取文件
     */
    async readFile()
    {
        const data = await this.rs.fs.readArrayBuffer(this.assetPath);
        this.arraybuffer = data;
    }
}
