/*
 * @Author: your name
 * @Date: 2021-04-12 16:06:34
 * @LastEditTime: 2021-04-12 18:42:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \derive\src\js\dangerousAirArea.js
 */
/*
 * @Author: your name
 * @Date: 2021-04-12 16:06:34
 * @LastEditTime: 2021-04-12 18:38:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \derive\src\js\dangerousAirArea.js
 */

let calcAirParam = [
  { bear: 105, distance: 8 },
  { bear: 135, distance: 3 },
  { bear: 171, distance: 14 },
  { bear: 195, distance: 14 },
  { bear: 245, distance: 4.5 },
  { bear: 262, distance: 14 },
  { bear: 280, distance: 14 },
  { bear: 294, distance: 4.5 },
  { bear: 344, distance: 14 },
  { bear: 5, distance: 14 },
  { bear: 50, distance: 3 },
  { bear: 75, distance: 8 }
];
let calcCarParam = [
    { bear: 73, distance: 6 },
    { bear: 107, distance: 6 },
    { bear: 253, distance: 6 },
    { bear: 287, distance: 6 }
];
import CaculateaPos from './CaculateaPos.js'
import EntityMode from './EntityMode.js'
function DangerousAirArea(options) {
  if (!Cesium.defined(options)) return;
  if (!Cesium.defined(options.viewer)) return;
  this._viewer = options.viewer;
  this._positionOrigin = Cesium.defaultValue(options.positionOrigin, null);
  this._material = Cesium.defaultValue(options.material, Cesium.Color.CHOCOLATE.withAlpha(0.5));
  this._outlineColor = Cesium.defaultValue(options.outlineColor, Cesium.Color.AQUA);
  this._baseHeading = Cesium.defaultValue(options.baseHeading, 0);
  this._entityType = Cesium.defaultValue(options.entityType, EntityMode.air);
  this._positions = [];
  if(this._entityType === EntityMode.air){
    this.camputerParam = Cesium.defaultValue(options.calcParam, calcAirParam);
  }else if(this._entityType === EntityMode.car){
    this.camputerParam = Cesium.defaultValue(options.calcParam, calcCarParam);
  }

  if (this._positionOrigin) {
    let computerParam = this.camputerParam;
    for (let i = 0; i < computerParam.length; i++) {
      let obj = computerParam[i];
      let pos = CaculateaPos.destinationVincenty(this._positionOrigin, obj.bear + this._baseHeading, obj.distance);
      this._positions.push(pos.lon);
      this._positions.push(pos.lat);
      this._positions.push(0.1);
    }
  }
}
DangerousAirArea.prototype.addArea = function () {
  let viewer = this._viewer;
  if (this._positions && viewer) {
    let areaEntity = viewer.entities.add({
      name: "Cyan vertical polygon with per-position heights and outline",
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(this._positions),
        perPositionHeight: true,
        material: this._material,
        outline: true,
        outlineColor: this._outlineColor,
        classificationType: Cesium.ClassificationType.BOTH
      }
    });
    this._areaEntity = areaEntity;
  }
}

Object.defineProperties(DangerousAirArea.prototype, {
  positions: {
    get() {
      return this._positions
    },
    set: function (value) {
      if (value) {
        this._positions = value;
        if (this._areaEntity) {
          this._areaEntity.polygon.hierarchy = value;
        }
      }
    }
  },
  material: {
    get: function () {
      return this._material;
    },
    set: function (value) {
      this._material = value;
      if (this._areaEntity) {
        this._areaEntity.polygon.material = value;
      }
    }
  },
  outlineColor: {
    get: function () {
      return this._outlineColor;
    },
    set: function (value) {
      this._outlineColor = value;
      if (this._areaEntity) {
        this._areaEntity.polygon.outlineColor = value;
      }
    }
  }
})

export default DangerousAirArea;