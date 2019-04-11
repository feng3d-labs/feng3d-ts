type gPartial<T> = {
    [P in keyof T]?: gPartial<T[P]>;
};

namespace feng3d
{
    /**
     * feng3d的版本号
     */
    export var revision: string = "2019.04.11.00";

    console.log(`feng3d version ${revision}`)
}