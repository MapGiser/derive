/*
 * @Author: your name
 * @Date: 2021-04-12 16:06:34
 * @LastEditTime: 2021-04-14 14:23:38
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
  { bear: 110, distance: 15.5 },
  { bear: 140, distance: 5.5 },
  { bear: 161, distance: 18 },
  { bear: 205, distance: 18 },
  { bear: 225, distance: 9 },
  { bear: 252, distance: 22 },
  { bear: 288, distance: 22 },
  { bear: 315, distance: 9 },
  { bear: 335, distance: 18 },
  { bear: 19, distance: 18 },
  { bear: 40, distance: 5.5 },
  { bear: 70, distance: 15.5 }
];
let calcCarParam = [
  { bear: 73, distance: 6 },
  { bear: 107, distance: 6 },
  { bear: 253, distance: 6 },
  { bear: 287, distance: 6 }
];
let bestPositions = [
  { bear: 135,baseHeading:225, distance: 15 },
  { bear: 180,baseHeading:90, distance: 20 },
  { bear: 195,baseHeading:100, distance: 20 },
  { bear: 45,baseHeading:135, distance: 15 },
  { bear: 0,baseHeading:90, distance: 20 },
  { bear: 345,baseHeading:80, distance: 20 },
  // { bear: 189, distance: 6 },
  // { bear: 189, distance: 6 },
  // { bear: 180, distance: 6 },

  // { bear: 345, distance: 6 },
  // { bear: 30, distance: 6 },
  // { bear: 45, distance: 6 }
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
  this._eventType = 'dangerousArea';

  // if(this._entityType === EntityMode.air){
  //   this.camputerParam = Cesium.defaultValue(options.calcParam, calcAirParam);
  // }else if(this._entityType === EntityMode.car){
  //   this.camputerParam = Cesium.defaultValue(options.calcParam, calcCarParam);
  // }


}

DangerousAirArea.prototype.calcDangerousArea = function (positionOrigin, baseHeading, calcParam) {
  if (positionOrigin) {
    let positions = [];
    let computerParam = calcParam;
    for (let i = 0; i < computerParam.length; i++) {
      let obj = computerParam[i];
      let pos = CaculateaPos.destinationVincenty(positionOrigin, obj.bear + baseHeading, obj.distance);
      positions.push(pos.lon);
      positions.push(pos.lat);
      positions.push(0.1);
    }
    return positions;
  }
}

DangerousAirArea.prototype.calcBestPositionsOrigins = function () {
  let bestPositionsOrigin = [];
  for (let i = 0; i < bestPositions.length; i++) {
    let bestpos = bestPositions[i];
    let pos = CaculateaPos.destinationVincenty(this._positionOrigin, bestpos.bear + this._baseHeading, bestpos.distance);
    bestPositionsOrigin.push(pos)
  }
  return bestPositionsOrigin;
}

DangerousAirArea.prototype.calcBestPositions = function () {
  let bestAreaPositions = [];
  let bestPositionsOrigin = this.calcBestPositionsOrigins();
  if (bestPositionsOrigin && bestPositionsOrigin.length > 0) {
    for (let i = 0; i < bestPositionsOrigin.length; i++) {
      let bestpos = bestPositionsOrigin[i];
      let positions = this.calcDangerousArea(bestpos, bestPositions[i].baseHeading + this._baseHeading, calcCarParam);
      bestAreaPositions.push(positions)
    }
  }
  return bestAreaPositions;
}

DangerousAirArea.prototype.addArea = function () {
  let viewer = this._viewer;
  this._positions = this.calcDangerousArea(this._positionOrigin, this._baseHeading, calcAirParam);
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

DangerousAirArea.prototype.addBestArea = function (poss) {
  let bestEntities = [];
  let viewer = this._viewer;
  let positions = this.calcBestPositions();
  if (positions && positions.length > 0) {
    for (let i = 0; i < positions.length; i++) {
      let areaEntity = viewer.entities.add({
        name: "Cyan vertical polygon with per-position heights and outline",
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(positions[i]),
          perPositionHeight: true,
          material: this._material,
          outline: true,
          outlineColor: this._outlineColor,
          classificationType: Cesium.ClassificationType.BOTH
        }
      });
      bestEntities.push(areaEntity);
    }
  }
  this._bestEntities = bestEntities;
}

DangerousAirArea.prototype.destory = function () {
  let viewer = this._viewer;
  if (this._areaEntity && viewer) {
    viewer.entities.remove(this._areaEntity);
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
  },
  areaEntity: {
    get: function () {
      return this._areaEntity;
    },
    set: function (value) {
      this._areaEntity = value;
    }
  }
})

export default DangerousAirArea;