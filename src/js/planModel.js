
function PlanModel(options) {
  if (!options.viewer) {
    throw new Error('options.viewer is required!');
  }
  this.viewer = options.viewer;
  this._entityModel = null;
  this._modelPath = Cesium.defaultValue(options.modelPath, null);
  this._model = Cesium.defaultValue(options.model, null);
  this._minimumPixelSize = Cesium.defaultValue(options.minimumPixelSize, 1);
  this._maximumScale = Cesium.defaultValue(options.maximumScale, 1);
  this._modelGraphic = Cesium.defaultValue(options.modelGraphic, null);
  this._name = Cesium.defaultValue(options.name, 'PlanManagement');
  this._show = Cesium.defaultValue(options.show, true);
  this._positions = Cesium.defaultValue(options.position, null);


  this._startTime = this._time0 = Cesium.defaultValue(options.startTime, null);
  this._middleTime = Cesium.defaultValue(options.middleTime, null);
  this._endTime= this._time1 = Cesium.defaultValue(options.endTime, null);

  // this._time0 = Cesium.defaultValue(options.modelStartTime, null);
  // this._time1 = Cesium.defaultValue(options.modelEndTime, null);

  this._minTime = Cesium.Iso8601.MINIMUM_VALUE;
  this._maxTime = Cesium.Iso8601.MAXIMUM_VALUE;

  if (!this._middleTime) {
    var timeSeconds = Cesium.JulianDate.secondsDifference(this._endTime, this._startTime);
    var middleTime = Cesium.JulianDate.addSeconds(this._startTime, timeSeconds / 2, new Cesium.JulianDate());
    this._middleTime = middleTime;
  }

  this._time = Cesium.defaultValue({ start: this._startTime, middle: this._middleTime, end: this._endTime }, null);
}

PlanModel.prototype.init = function () {
  if (this._modelPath) {
    this.addModel();
  }
}

PlanModel.prototype.addModel = function () {
  var viewer = this.viewer;

  if (this._time) {
    let timeStop = Cesium.JulianDate.secondsDifference(this._endTime, this._startTime);
    let middleTime = Cesium.JulianDate.addSeconds(this._startTime, timeStop / 2, new Cesium.JulianDate());
    this._middleTime = Cesium.defaultValue(this._middleTime, middleTime);
    this._time.middle = this._middleTime;
  }
  if (this._modelPath) {
    if (this._model) {
      this._modelGraphic = this._model;
    } else {
      var model = this.initModel(this._modelPath);
      this._modelGraphic = model;
    }
  }
  if (this._positions && this._time) {
    //位于时间段之前的位置
    var positionBefore = this.computePathBeforeTime(this._positions);
    //位于时间段内的位置
    var positionIn = this.computePathInTime(this._positions, this._time);
    //位于时间段之后的位置
    var positionAfter = this.computePathAfterTime(this._positions);
    // 四元数
    this._orientation = this.initOrientation(positionIn);
    // 用于最后矫正飞机的姿态
    // this._startOrition = this.initOrientation(positionBefore);
    // this._endOrition = this.initOrientation(positionAfter);
    // this._startOrition = this._orientation.getValue(this._orientationStartTime, new Cesium.Quaternion());
    // this._endOrition = this._orientation.getValue(this._orientationEndTime, new Cesium.Quaternion());
  }
  var entity;
  let that = this;
  if (this._model) {
    this._modelGraphic.orientation = this._orientation;
    this._modelGraphic.position = new Cesium.CallbackProperty(function (time) {

      if (Cesium.JulianDate.lessThan(time, that._time0) && Cesium.JulianDate.greaterThan(time, that._minTime)) {
        // if (entity) {
        //   entity.orientation = that._orientationStartTime;
        // }
        return positionBefore.getValue(time, new Cesium.Cartesian3());
      } else if (Cesium.JulianDate.greaterThan(time, that._time1) && Cesium.JulianDate.lessThan(time, that._maxTime)) {
        // if (entity) {
        //   entity.orientation = that._orientationEndTime;
        // }
        return positionAfter.getValue(time, new Cesium.Cartesian3());
      } else {
        return positionIn.getValue(time, new Cesium.Cartesian3());
      }
    }, false);
    entity = this._modelGraphic;

  } else if (this._modelPath) {
    var entity = viewer.entities.add({
      orientation: this._orientation,
      model: this._modelGraphic,
      position: new Cesium.CallbackProperty(function (time) {
        if (Cesium.JulianDate.lessThan(time, that._time0) && Cesium.JulianDate.greaterThan(time, that._minTime)) {
          // if (entity) {
          //   entity.orientation = that._orientationStartTime;
          // }
          return positionBefore.getValue(time, new Cesium.Cartesian3());
        } else if (Cesium.JulianDate.greaterThan(time, that._time1) && Cesium.JulianDate.lessThan(time, that._maxTime)) {
          // if (entity) {
          //   entity.orientation = that._orientationEndTime;
          // }
          return positionAfter.getValue(time, new Cesium.Cartesian3());
        } else {
          return positionIn.getValue(time, new Cesium.Cartesian3());
        }
      }, false)

    });
  }
  this._entityModel = entity;
  return entity;

}

PlanModel.prototype.initModel = function (_modelPath) {
  if (_modelPath) {
    var options = {
      uri: _modelPath,
      minimumPixelSize: this._minimumPixelSize || 10,
      maximumScale: this._maximumScale || 1.0,
    }
    return new Cesium.ModelGraphics(options)
  }
}

PlanModel.prototype.initOrientation = function (_positions) {
  if (_positions) {
    this._orientation = new Cesium.VelocityOrientationProperty(_positions);
    return this._orientation;
  }
}

PlanModel.prototype.computePathBeforeTime = function (_positions) {
  if (_positions && this._time0) {
    var property = new Cesium.SampledPositionProperty();
    var timeBefore = Cesium.JulianDate.addSeconds(
      this._time0,
      -100000,
      new Cesium.JulianDate()
    );
    for (var i = 0; i <= 100000; i += 1000) {
      var timeUse = Cesium.JulianDate.addSeconds(
        timeBefore,
        i,
        new Cesium.JulianDate()
      );
      var position = _positions[0];
      property.addSample(timeUse, position);
    }
    this._beforeTimeProperty = property;
    return property;
  }
}

PlanModel.prototype.computePathInTime = function (_positions, _time) {
  if (_positions && _time) {
    var length = _positions.length;//3
    var timeStep = 0;
    // if (_time.start && _time.end) {
    if (this._time0 && this._time1) {
      timeStep = (this._time1.secondsOfDay - this._time0.secondsOfDay) / (length - 1);
    }

    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i < length; i++) {
      var timeUse = Cesium.JulianDate.addSeconds(
        this._time0,
        i * timeStep,
        new Cesium.JulianDate()
      );
      var position = _positions[i];
      property.addSample(timeUse, position);
      // if (i == 1 || i == 0) {
      //   propertyStart.addSample(timeUse, position);
      //   this._orientationStartTime = propertyStart;
      // }
      // if (i == length - 3 || i === length - 2) {
      //   propertyEnd.addSample(timeUse, position);
      //   this._orientationEndTime = propertyEnd;
      // }
    }
    this._propertyPsotion = property;
    return property;
  }
}

PlanModel.prototype.computePathAfterTime = function (_positions) {
  if (_positions && this._time1) {
    var property = new Cesium.SampledPositionProperty();
    var length = 100000;
    for (var i = 0; i <= length; i += 1000) {
      var timeUse = Cesium.JulianDate.addSeconds(
        this._time1,
        i,
        new Cesium.JulianDate()
      );
      var position = _positions[_positions.length - 1];
      property.addSample(timeUse, position);
    }
    this._afterTimeProperty = property;
    return property;
  }
}

// PlanModel.prototype.render = function () {
//   let viewer = this.viewer;
//   let that = this;
//   let isShow = false;
//   let middleBeforeTime = Cesium.JulianDate.addSeconds(that._middleTime, -2, new Cesium.JulianDate());
//   var listenser = function () {
//     if (viewer.clock.currentTime >= middleBeforeTime) {
//       if (!isShow) {
//         if (that._entityModel) {
//           that._entityModel.orientation = that._endOrition;
//         }
//       }
//     } else if (viewer.clock.currentTime < middleBeforeTime && viewer.clock.currentTime >= that._startTime) {
//       if (that._orientation) {
//         that._entityModel.orientation = that._orientation;
//       }
//     }
//     // else {
//     //   that._entityModel.orientation = that._orientation;
//     // }
//     if (viewer.clock.currentTime > that._middleTime) {
//       isShow = true;
//     }
//     if (isShow) {
//       viewer.scene.preRender.removeEventListener(listenser);
//     }
//   }

//   viewer.scene.preRender.addEventListener(listenser);
// }

PlanModel.prototype.show = function () {
  if (this._entityModel) {
    this._entityModel.show = true;
  }
}

PlanModel.prototype.hide = function () {
  if (this._entityModel) {
    this._entityModel.show = false;
  }
}




Object.defineProperties(PlanModel, {
  modelPath: {
    get: function () {
      return this._modelPath;
    },
    set: function (value) {
      if (value) {
        this._modelPath = value;
      }
    }
  },
  modelGraphic: {
    get: function () {
      return this._modelGraphic;
    },
    set: function (value) {
      if (value) {
        this._modelGraphic = value;
      }
    }
  },
  modelStartTime: {
    get: function () {
      return this._time0;
    },
    set: function (value) {
      if (value) {
        this.time0 = value;
      }
    }
  },
  modelEndTime: {
    get: function () {
      return this._time1;
    },
    set: function (value) {
      if (value) {
        this.time1 = value;
      }
    }
  },
  positions: {
    get: function () {
      return this._positions;
    },
    set: function (value) {
      if (value) {
        this._positions = value;
      }

    }
  },
  startTime: {
    get: function () {
      return this._time.start;
    },
    set: function (value) {
      if (value) {
        this._time.start = value;
      }

    }
  },
  endTime: {
    get: function () {
      return this._time.end;
    },
    set: function (value) {
      if (value) {
        this._time.end = value;
      }
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

export default PlanModel;