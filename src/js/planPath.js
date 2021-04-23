/*
 * @Author: your name
 * @Date: 2021-03-31 10:34:28
 * @LastEditTime: 2021-04-22 21:40:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \derive\src\js\planPath.js
 */

function PlanPath(options) {
  if (!options.viewer) {
    throw new Error('options.viewer is required!');
  }
  this.viewer = options.viewer;
  this._entityModel = null;
  this._eventType = 'path';
  this._show = Cesium.defaultValue(options.show, true);
  this._positions = Cesium.defaultValue(options.position, null);
  this._modelId = Cesium.defaultValue(options.modelId, null);

}

PlanPath.prototype.init = function () {
  if (this._positions) {
    this.addPath();
  }
}

PlanPath.prototype.addPath = function () {
  let path = this.initPath()
  var entity = viewer.entities.add(path);
  this._entityModel = entity;
  return entity;
}

PlanPath.prototype.initPath = function () {
  let entity = new Cesium.Entity({
    polyline: {
      positions: this._positions,
      width: 4,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.CYAN
      }),
      clampToGround: true,
      classificationType: Cesium.ClassificationType.BOTH
    }
  })
  return entity;
}

PlanPath.prototype.show = function () {
  if (this._entityModel) {
    this._entityModel.show = true;
  }
}

PlanPath.prototype.hide = function () {
  if (this._entityModel) {
    this._entityModel.show = false;
  }
}

Object.defineProperties(PlanPath, {
  modelId:{
    get:function(){
      return this._modelId
    },
    set:function(value){
      this._modelId = value
    }
  },
  show: {
    get: function () {
      return this._show;
    },
    set: function (value) {
      this._show = value;
      this._entityModel.show = value;
    }
  }
})

export default PlanPath;