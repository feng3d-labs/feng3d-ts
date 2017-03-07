module feng3d
{
    /**
     * 线条3D对象
     * @author feng 2017-02-06
     */
    export class SegmentObject3D extends Object3D
    {
        public segmentGeometry: SegmentGeometry;
        public material: SegmentMaterial;

        constructor(name = "Segment3D")
        {
            super(name);
            this.material = this.getOrCreateComponentByClass(MeshRenderer).material = new SegmentMaterial();
            var segmentGeometry = this.segmentGeometry = new SegmentGeometry();
            var geometry = this.getOrCreateComponentByClass(Geometry);
            geometry.addComponent(segmentGeometry);
        }
    }
}