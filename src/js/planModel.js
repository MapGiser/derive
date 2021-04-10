
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
  this._eventType = 'model';
  this._speed = Cesium.defaultValue(options.speed, 30);//km/h


  this._startTime = Cesium.defaultValue(options.startTime, null);
  this._middleTime = Cesium.defaultValue(options.middleTime, null);
  this._endTime = Cesium.defaultValue(options.endTime, null);

  this._minTime = Cesium.Iso8601.MINIMUM_VALUE;
  this._maxTime = Cesium.Iso8601.MAXIMUM_VALUE;

  //根据速度计算运动时间
  if (this._positions) {
    this._totalDistance = this.calcTotalDistance();
    this._timeMoving = this._totalDistance / (this._speed * 1000 / 3600);
    this._endTime = Cesium.JulianDate.addSeconds(this._startTime, this._timeMoving, new Cesium.JulianDate());
  }

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

PlanModel.prototype.calcTotalDistance = function () {
  let totalDistance = 0
  if (this._positions && this._positions.length > 0) {
    let position = this._positions;
    for (let i = 0; i < position.length - 1; i++) {
      totalDistance += Cesium.Cartesian3.distance(position[i], position[i + 1]);
    }
    return totalDistance;
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
    this._positionBefore = this.computePathBeforeTime(this._positions);
    //位于时间段内的位置
    this._positionIn = this.computePathInTime(this._positions);
    //位于时间段之后的位置
    this._positionAfter = this.computePathAfterTime(this._positions);
    // 四元数
    this._orientation = this.initOrientation(this._positionIn);
    // 用于最后矫正飞机的姿态
    this._startOrition = this._orientation.getValue(this._orientationStartTime, new Cesium.Quaternion());
    this._endOrition = this._orientation.getValue(this._orientationEndTime, new Cesium.Quaternion());
  }
  var entity;
  let that = this;
  if (this._model) {
    this._modelGraphic.orientation = this._orientation;
    this._modelGraphic.position = new Cesium.CallbackProperty(function (time) {
      if (Cesium.JulianDate.lessThan(time, that._startTime) && Cesium.JulianDate.greaterThan(time, that._minTime)) {
        // if (entity) {
        //   entity.orientation = that._startOrition;
        // }
        let position = that._positionBefore.getValue(time, new Cesium.Cartesian3());
        return position = position ? position : that._positions[0];
      } else if (Cesium.JulianDate.greaterThan(time, that._endTime) && Cesium.JulianDate.lessThan(time, that._maxTime)) {
        if (entity) {
          entity.orientation = that._endOrition;
        }
        return that._positionAfter.getValue(time, new Cesium.Cartesian3());
      } else {
        if (entity) {
          entity.orientation = that._orientation;
        }
        return that._positionIn.getValue(time, new Cesium.Cartesian3());
      }
    }, false);
    entity = this._modelGraphic;
  } else if (this._modelPath && !this._model) {
    var entity = viewer.entities.add({
      orientation: this._orientation,
      model: this._modelGraphic,
      position: new Cesium.CallbackProperty(function (time) {
        if (Cesium.JulianDate.lessThan(time, that._startTime) && Cesium.JulianDate.greaterThan(time, that._minTime)) {
          // if (entity) {
          //   entity.orientation = that._startOrition;
          // }
          // return that._positionBefore.getValue(time, new Cesium.Cartesian3());
          // return that._positions[0];
          let position = that._positionBefore.getValue(time, new Cesium.Cartesian3());
          return position = position ? position : that._positions[0];
        } else if (Cesium.JulianDate.greaterThan(time, that._endTime) && Cesium.JulianDate.lessThan(time, that._maxTime)) {
          if (entity) {
            entity.orientation = that._endOrition;
          }
          return that._positionAfter.getValue(time, new Cesium.Cartesian3());
        } else {
          if (entity) {
            entity.orientation = that._orientation;
          }
          return that._positionIn.getValue(time, new Cesium.Cartesian3());
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
  if (_positions && this._startTime) {
    var property = new Cesium.SampledPositionProperty();
    var timeBefore = Cesium.JulianDate.addSeconds(
      this._startTime,
      -10000,
      new Cesium.JulianDate()
    );
    for (var i = 0; i <= 10000; i += 1000) {
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

PlanModel.prototype.computePathInTime = function (_positions) {
  if (_positions) {
    var length = _positions.length;
    var timeStep = 0;
    if (this._startTime && this._endTime) {
      timeStep = (this._endTime.secondsOfDay - this._startTime.secondsOfDay) / (length - 1);
    }

    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i < length; i++) {
      var timeUse = Cesium.JulianDate.addSeconds(
        this._startTime,
        i * timeStep,
        new Cesium.JulianDate()
      );
      var position = _positions[i];
      property.addSample(timeUse, position);
      if (i == 1) {
        this._orientationStartTime = timeUse;
      }
      if (i === length - 1) {
        this._orientationEndTime = timeUse;
      }
    }
    this._propertyPsotion = property;
    return property;
  }
}

PlanModel.prototype.computePathAfterTime = function (_positions) {
  if (_positions && this._endTime) {
    var property = new Cesium.SampledPositionProperty();
    var length = 100000;
    for (var i = 0; i <= length; i += 1000) {
      var timeUse = Cesium.JulianDate.addSeconds(
        this._endTime,
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


Object.defineProperties(PlanModel.prototype, {
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
  startTime: {
    get: function () {
      return this._startTime;
    },
    set: function (value) {
      if (value) {
        this.time0 = this._startTime = value;

        this._positionBefore = this.computePathBeforeTime(this._positions);
        //位于时间段内的位置
        this._positionIn = this.computePathInTime(this._positions);
        //位于时间段之后的位置
        this._positionAfter = this.computePathAfterTime(this._positions);
        // 四元数
        this._orientation = this.initOrientation(this._positionIn);
        // 用于最后矫正飞机的姿态
        this._startOrition = this._orientation.getValue(this._orientationStartTime, new Cesium.Quaternion());
        this._endOrition = this._orientation.getValue(this._orientationEndTime, new Cesium.Quaternion());
      }
    }
  },
 
  endTime: {
    get: function () {
      return this._endTime;
    },
    set: function (value) {
      if (value) {
        this.time1 = this._endTime = value;

        this._positionBefore = this.computePathBeforeTime(this._positions);
        //位于时间段内的位置
        this._positionIn = this.computePathInTime(this._positions);
        //位于时间段之后的位置
        this._positionAfter = this.computePathAfterTime(this._positions);
        // 四元数
        this._orientation = this.initOrientation(this._positionIn);
        // 用于最后矫正飞机的姿态
        this._startOrition = this._orientation.getValue(this._orientationStartTime, new Cesium.Quaternion());
        this._endOrition = this._orientation.getValue(this._orientationEndTime, new Cesium.Quaternion());
      }
    }
  },
  speed: {
    get: function () {
      return this._speed;
    },
    set: function (value) {
      if (Cesium.defined(value)) {
        this._speed = value;
        if (this._positions) {
          this._totalDistance = this.calcTotalDistance();
          this._timeMoving = this._totalDistance / (this._speed * 1000 / 3600);
          this._endTime = Cesium.JulianDate.addSeconds(this._startTime, this._timeMoving, new Cesium.JulianDate());

          this._positionBefore = this.computePathBeforeTime(this._positions);
          //位于时间段内的位置
          this._positionIn = this.computePathInTime(this._positions);
          //位于时间段之后的位置
          this._positionAfter = this.computePathAfterTime(this._positions);
          // 四元数
          this._orientation = this.initOrientation(this._positionIn);
          // 用于最后矫正飞机的姿态
          this._startOrition = this._orientation.getValue(this._orientationStartTime, new Cesium.Quaternion());
          this._endOrition = this._orientation.getValue(this._orientationEndTime, new Cesium.Quaternion());
        }
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