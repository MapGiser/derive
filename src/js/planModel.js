
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
  this._startTime = Cesium.defaultValue(options.startTime, null);
  this._middleTime = Cesium.defaultValue(options.middleTime, null);
  this._endTime = Cesium.defaultValue(options.endTime, null);
  if (!this._middleTime) {
    var timeSeconds = Cesium.JulianDate.secondsDifference(this._endTime, this._startTime);
    var middleTime = Cesium.JulianDate.addSeconds(this._startTime, timeSeconds / 2, new Cesium.JulianDate());
    this._middleTime = middleTime;
  }

  this._time = Cesium.defaultValue({ start: this._startTime, middle: this._middleTime, end: this._endTime }, null);

  this._pathObject = Cesium.defaultValue(options.pathObject, {
    pathWidth: 10,
    pathShow: false,
    pathColor: Cesium.Color.YELLOW,
    pathResolution: 1,
  });

  // this.render();

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
    var availability = this.initAvibility(this._time);
  }
  if (this._modelPath) {
    if (this._model) {
      this._modelGraphic = this._model;
    } else {
      var model = this.initModel(this._modelPath);
      this._modelGraphic = model;
    }
  }
  var path = this.initPath(this._pathObject);
  if (this._positions && this._time) {
    // if (this._model) {
    //   let postion = this._model.position._value;
    //   this._positions.unshift(postion);
    // }
    var position = this.computePath(this._positions, this._time);
    this._orientation = this.initOrientation(position);
    // 用于最后矫正飞机的姿态
    this._endOrition = this._orientation.getValue(this._orientationTime, new Cesium.Quaternion())
  }
  var entity;
  if (this._model) {
    this._modelGraphic.availability = availability;
    this._modelGraphic.orientation = this._orientation;
    this._modelGraphic.path = path;
    this._modelGraphic.position = position;
    entity = this._modelGraphic;
  } else if (this._modelPath) {
    var entity = viewer.entities.add({
      availability: availability,
      position: position,
      orientation: this._orientation,
      model: this._modelGraphic,
      path: path
    });
  }


  this._entityModel = entity;
  return entity;

}

PlanModel.prototype.initModel = function (_modelPath) {
  if (_modelPath) {
    var options = {
      uri: _modelPath,
      minimumPixelSize: this._minimumPixelSize || 0.1,
      maximumScale: this._maximumScale || 0.51,
    }
    return new Cesium.ModelGraphics(options)
  }
}

PlanModel.prototype.initPath = function (path) {
  if (path) {
    return {
      show: path.pathShow,
      resolution: path.pathResolution,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: path.pathColor
      }),
      width: path.pathWidth,
    }
  }
}

PlanModel.prototype.initAvibility = function (_time) {
  if (_time) {
    var start = _time.start;
    var end = Cesium.JulianDate.addSeconds(_time.end, 10, new Cesium.JulianDate());
    if (start && end) {
      return new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: end,
        })
      ])
    }
  }
}

PlanModel.prototype.initOrientation = function (_positions) {
  if (_positions) {
    this._orientation = new Cesium.VelocityOrientationProperty(_positions);
    return this._orientation;
  }
}

PlanModel.prototype.computePath = function (_positions, _time) {
  if (_positions && _time) {
    var length = _positions.length;//3
    var timeStep;
    if (_time.start && _time.middle) {
      timeStep = (_time.middle.secondsOfDay - _time.start.secondsOfDay) / (length - 1);//20
    }

    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i < length; i++) {
      var timeUse = Cesium.JulianDate.addSeconds(
        _time.start,
        i * timeStep,
        new Cesium.JulianDate()
      );
      var position = _positions[i];
      property.addSample(timeUse, position);
      if (i == length - 2) {
        this._orientationTime = timeUse;
      }
    }

    var timeEndSeconds = Cesium.JulianDate.secondsDifference(_time.end, _time.middle);
    timeEndSeconds += 10;
    for (var j = 0; j < timeEndSeconds; j += 5) {
      var timeUse = Cesium.JulianDate.addSeconds(
        _time.middle,
        j,
        new Cesium.JulianDate()
      );
      var position = _positions[_positions.length - 1];
      property.addSample(timeUse, position);
    }
    this._propertyPsotion = property;
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

  pathObject: {
    get: function () {
      return this._pathObject;
    },
    set: function (value) {
      if (value) {
        this._pathObject = value;
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