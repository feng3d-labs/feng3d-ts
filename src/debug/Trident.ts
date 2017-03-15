module feng3d
{
    /**
     * 坐标系，三叉戟
     * @author feng 2017-02-06
     */
    export class Trident extends Object3D
    {
        private _xLine: Object3D;
        private _yLine: Object3D;
        private _zLine: Object3D;

        private _xArrow: ConeObject3D;
        private _yArrow: ConeObject3D;
        private _zArrow: ConeObject3D;

        constructor(length = 100)
        {
            super();
            this.buildTrident(Math.abs((length == 0) ? 10 : length));
        }

        private buildTrident(length: number)
        {
            this._xLine = new Object3D();
            var segmentGeometry = this._xLine.getOrCreateComponentByClass(SegmentGeometry);
            segmentGeometry.addSegment(new Segment(new Vector3D(), new Vector3D(length, 0, 0), 0xff0000, 0xff0000));
            this._xLine.addComponent(segmentGeometry);
            this._xLine.getOrCreateComponentByClass(Model).material = new SegmentMaterial();
            this.addChild(this._xLine);
            //
            this._yLine = new Object3D();
            var segmentGeometry = this._yLine.getOrCreateComponentByClass(SegmentGeometry);
            segmentGeometry.addSegment(new Segment(new Vector3D(), new Vector3D(0, length, 0), 0x00ff00, 0x00ff00));
            this._yLine.addComponent(segmentGeometry);
            this._yLine.getOrCreateComponentByClass(Model).material = new SegmentMaterial();
            this.addChild(this._yLine);
            //
            this._zLine = new Object3D();
            var segmentGeometry = this._zLine.getOrCreateComponentByClass(SegmentGeometry);
            segmentGeometry.addSegment(new Segment(new Vector3D(), new Vector3D(0, 0, length), 0x0000ff, 0x0000ff));
            this._zLine.addComponent(segmentGeometry);
            this._zLine.getOrCreateComponentByClass(Model).material = new SegmentMaterial();
            this.addChild(this._zLine);
            //
            this._xArrow = new ConeObject3D(5, 18);
            this._xArrow.transform.position.x = length;
            this._xArrow.transform.rotation.z = -90;
            var material = this._xArrow.getOrCreateComponentByClass(Model).material = new StandardMaterial();
            material.baseColor = new Color(1, 0, 0);
            this.addChild(this._xArrow);
            //
            this._yArrow = new ConeObject3D(5, 18);
            this._yArrow.transform.position.y = length;
            var material = this._yArrow.getOrCreateComponentByClass(Model).material = new StandardMaterial();
            material.baseColor = new Color(0, 1, 0);
            this.addChild(this._yArrow);
            //
            this._zArrow = new ConeObject3D(5, 18);
            this._zArrow.transform.position.z = length;
            this._zArrow.transform.rotation.x = 90;
            var material = this._zArrow.getOrCreateComponentByClass(Model).material = new StandardMaterial();
            material.baseColor = new Color(0, 0, 1);
            this.addChild(this._zArrow);
        }
    }
}