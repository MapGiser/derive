import Complex from './com.js';
import planMode from './planMode.js';
function PlanEvent(options) {
  if (!options.viewer) {
    console.error('viewer is required!')
  }
  this._viewer = options.viewer;
  this._startTime = Cesium.defaultValue(options.startTime, null);
  this._endTime = Cesium.defaultValue(options.endTime, null);
  this._eventType = Cesium.defaultValue(options.eventType, null);
  this._emissionRate = Cesium.defaultValue(options.emissionRate, 180);
  this._position = Cesium.defaultValue(options.position, null);
  this._positionOringon = Cesium.defaultValue(options.positionOringon, null);
  this._positionEnd = Cesium.defaultValue(options.positionEnd, null);
  this._event = Cesium.defaultValue(options.event, null);
  this._fireWorksBearAngle = Cesium.defaultValue(options.fireWorksBearAngle, 0.0);
  this._fireWorksLevelAngle = Cesium.defaultValue(options.fireWorksLevelAngle, 0.0);

  this._minimumTime = Cesium.Iso8601.MINIMUM_VALUE;

}

PlanEvent.prototype.addEvent = function (options) {
  let viewer = this._viewer;
  let eventType = options.eventType;
  if (typeof (eventType) != "undefined" && eventType != null) {
    this._eventType = eventType;
    let event = this.addEventByEventType(options);
    if (event) {
      this._event = viewer.scene.primitives.add(event);
      return event;
    }
  }
}

PlanEvent.prototype.addEventByEventType = function (options) {
  let eventType = options.eventType;
  if (typeof (eventType) != "undefined" && eventType != null) {
    let event = null;
    switch (eventType) {
      case planMode.fire:
        event = this.addFireEvent();
        break;
      case planMode.fireworks:
        event = this.addFfireWorksEvent(options);
        break;
      case planMode.water:
        event = this.addWaterEvent(options);
        break;
      case planMode.explode:
        event = this.addExplodeEvent(options);
        break;
    }
    return event;
  }
}

// 计算方位角
PlanEvent.prototype.computerAzimuth = function (pos1, pos3) {
  if (pos1 && pos3) {
    var ph1 = Cesium.Cartographic.fromCartesian(pos1);
    var ph2 = Cesium.Cartographic.fromCartesian(pos3);

    var lon1 = ph1.longitude / Math.PI * 180;
    var lat1 = ph1.latitude / Math.PI * 180;

    var lon2 = ph2.longitude / Math.PI * 180;
    var lat2 = ph2.latitude / Math.PI * 180;

    var angle = Complex(lat1, lon1, lat2, lon2);
    angle = angle / 180 * Math.PI;
    angle = angle + Math.PI / 2;

    return angle;
  }

}

PlanEvent.prototype.addFireEvent = function () {
  let position = this._position;
  let startScale = 1.0;
  let endScale = 1.0;
  let that = this;

  function applyGravity(particle, dt) {
    var times = Cesium.JulianDate.secondsDifference(that._endTime, that._startTime);
    var middleTime = Cesium.JulianDate.addSeconds(that._startTime, times / 2, new Cesium.JulianDate());
    if (particle && that._event) {
      let time = that._viewer.clock.currentTime;
      if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
        that._event.startScale = that._event.endScale = 0.01;
        that._event.image = that._image;
        // that._event.startColor = that._event.endColornew = new Cesium.Color(0, 0, 0, 0.0);
      } else if (Cesium.JulianDate.lessThan(time, that._startTime)) {
        // that._event.startColor = new Cesium.Color(0, 0, 0, 0.0);
        that._event.image = that._image;
        that._event.startScale = that._event.endScale = 1.0;
      } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, middleTime)) {
        that._event.emissionRate = that._emissionRate || 180;
        that._event.startScale = startScale;
        that._event.image = that._image;
        that._event.endScale = endScale;
      } else if (Cesium.JulianDate.greaterThan(time, middleTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
        that._event.startScale = startScale;
        that._event.image = that._image;
        that._event.endScale = endScale;

        let emissionRate = ((that._endTime.secondsOfDay - time.secondsOfDay) / (that._endTime.secondsOfDay - middleTime.secondsOfDay))
        if (emissionRate < 0.1) emissionRate = 0.01;
        that._event.emissionRate = emissionRate * that._emissionRate;
      }
    }
  }
  if (position) {
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    return new Cesium.ParticleSystem({
      modelMatrix: modelMatrix,
      speed: this._speed || 15,
      lifetime: this._lifetime || 0.8,
      particleLife: 0.5,
      show: true,
      startScale: 1,
      endScale: 1,
      emitter: this._emitter || new Cesium.ConeEmitter(Cesium.Math.toRadians(55.0)),//new Cesium.BoxEmitter(new Cesium.Cartesian3(0.9,1.5,1.9)),
      image: this._image || './static/data/img/fire.png',
      emissionRate: this._emissionRate || 180.0,
      startColor: this._startColor || Cesium.Color.fromCssColorString('#ffffff'),
      endColor: this._endColor || Cesium.Color.fromCssColorString('#ffa000').withAlpha(0.6),
      imageSize: this._imageSize || new Cesium.Cartesian2(5, 2.5),
      updateCallback: this._updateCallback || applyGravity,
      mass: this._mass || 300,
      sizeInMeters: this._sizeInMeters || true
    })
  }
}

PlanEvent.prototype.addWaterEvent = function () {
  let positionOringon = this._positionOringon;//pos1
  let positionEnd = this._positionEnd;//pos3
  if (!positionOringon || !positionEnd) return;
  let offsetHeight = this._offsetHeight || 3.4;
  let image = this._image || './static/data/img/pq.png';
  let emissionRate = this._emissionRate || 50;
  let startScale = this._startScale || 1;
  let endScale = this._endScale || 1;
  let gravity = -1;
  var angle = this.computerAzimuth(positionOringon, positionEnd);//方位角
  var gravityScratch = new Cesium.Cartesian3();

  //计算距离
  var distance = Cesium.Cartesian3.distance(positionOringon, positionEnd);
  var minimumParticleLife = distance / 2;
  var maximumParticleLife = distance / 2;
  var speedMin, speedMax, pitch;
  //根据距离计算射程速度，决定能否射入目标点
  if (distance < 10) {
    speedMin = 2.0;
    speedMax = 2.5;
    pitch = Math.PI / 3;
    startScale = 0.6;
    endScale = 0.5;
    minimumParticleLife = maximumParticleLife = 15.0;
    emissionRate = 20.0;
  } else if (distance < 20) {
    speedMin = 3.0;
    speedMax = 4.0;
    pitch = Math.PI / 3;
    endScale = 1.2;
  } else if (distance < 30) {
    speedMin = 1 * Math.pow(2.1, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.2, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 1.8;
  } else if (distance < 40) {
    speedMin = 1 * Math.pow(2.3, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.4, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 1.8;
  } else if (distance < 50) {
    speedMin = 1 * Math.pow(2.4, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.5, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 60) {
    speedMin = 1 * Math.pow(2.6, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.7, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 70) {
    speedMin = 1 * Math.pow(2.7, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.85, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 80) {
    speedMin = 1 * Math.pow(2.8, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.9, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 100) {
    speedMin = 1 * Math.pow(3.0, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.1, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 120) {
    speedMin = 1 * Math.pow(3.1, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.2, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 140) {
    speedMin = 1 * Math.pow(3.2, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.35, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 160) {
    speedMin = 1 * Math.pow(3.3, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.4, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 3.0;
  } else if (distance < 170) {
    speedMin = 1 * Math.pow(3.45, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.55, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 3.0;
  } else if (distance < 180) {
    speedMin = 1 * Math.pow(3.55, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.65, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 190) {
    speedMin = 1 * Math.pow(3.60, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.70, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 200) {
    speedMin = 1 * Math.pow(3.6, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.7, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 220) {
    speedMin = 1 * Math.pow(3.7, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.8, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 240) {
    speedMin = 1 * Math.pow(3.8, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.9, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 260) {
    speedMin = 1 * Math.pow(3.9, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(4.0, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  }

  var emitterModelMatrix = new Cesium.Matrix4();
  var translation = new Cesium.Cartesian3();
  var rotation = new Cesium.Quaternion();
  var hpr = new Cesium.HeadingPitchRoll();
  var hpr = new Cesium.HeadingPitchRoll(angle, pitch, 0);
  var trs = new Cesium.TranslationRotationScale();

  function computeEmitterModelMatrix() {
    //喷泉位置
    trs.translation = Cesium.Cartesian3.fromElements(0, 0, offsetHeight, translation);
    trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

    return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
  }
  var that = this;
  //设置重力
  function applyGravity(p, dt) {
    var position = p.position;
    Cesium.Cartesian3.normalize(position, gravityScratch);
    Cesium.Cartesian3.multiplyByScalar(gravityScratch, gravity * dt, gravityScratch);
    p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);

    let time = that._viewer.clock.currentTime;
    if (Cesium.JulianDate.lessThan(time, that._startTime)) {
      that._event.startColor = new Cesium.Color(0, 0, 0, 0.0);
      that._event.image = null;

      that._event.startScale = that._event.endScale = 0.01;
      // that._event.show = false;
    } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
      // that._event.emissionRate = that._emissionRate;
      // that._event.show = true;
      that._event.startScale = startScale
      that._event.image = image;
      that._event.startColor = new Cesium.Color(1, 1, 1, 0.6);
      that._event.endColor = new Cesium.Color(0.80, 0.86, 1, 0.4)
      that._event.endScale = endScale;
    } else if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
      // that._event.emissionRate = 0.001;
      // that._event.show = false;
      that._event.startScale = that._event.endScale = 0.01;
      that._event.image = null;
      that._event.startColor = that._event.endColornew = new Cesium.Color(0, 0, 0, 0.0);
    }
  }


  //添加粒子
  return new Cesium.ParticleSystem({
    image: image,
    startColor: new Cesium.Color(1, 1, 1, 0.6),
    endColor: new Cesium.Color(0.80, 0.86, 1, 0.4),
    startScale: 0.01,
    endScale: 0.01,
    show: true,
    minimumParticleLife: minimumParticleLife,
    maximumParticleLife: maximumParticleLife,
    minimumSpeed: speedMin,
    maximumSpeed: speedMax,
    imageSize: new Cesium.Cartesian2(3.6, 3.6),
    emissionRate: emissionRate,
    emitter: new Cesium.CircleEmitter(0.5),
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(positionOringon),//computeModelMatrix(entity, viewer.clock.currentTime),
    emitterModelMatrix: computeEmitterModelMatrix(),
    updateCallback: this._updateCallback || applyGravity,
    sizeInMeters: true
  })

}

PlanEvent.prototype.addWaterEvent1 = function () {
  let positionOringon = this._positionOringon.clone();//pos1
  let positionEnd = this._positionEnd.clone();//pos3
  if (!positionOringon || !positionEnd) return;
  let offsetHeight = this._offsetHeight || 3.4;
  let image = this._image || './static/data/img/pq.png';
  let emissionRate = this._emissionRate || 50;
  let startScale = this._startScale || 1;
  let endScale = this._endScale || 1;
  let gravity = -1;
  let angle = this.computerAzimuth(positionOringon, positionEnd);//方位角
  let gravityScratch = new Cesium.Cartesian3();

  //计算距离
  let distance = Cesium.Cartesian3.distance(positionOringon, positionEnd);
  let minimumParticleLife = distance / 2;
  let maximumParticleLife = distance / 2;
  let speedMin, speedMax, pitch;
  //根据距离计算射程速度，决定能否射入目标点
  if (distance < 10) {
    speedMin = 2.0;
    speedMax = 2.5;
    pitch = Math.PI / 3;
    startScale = 0.6;
    endScale = 0.5;
    minimumParticleLife = maximumParticleLife = 15.0;
    emissionRate = 20.0;
  } else if (distance < 20) {
    speedMin = 3.0;
    speedMax = 4.0;
    pitch = Math.PI / 3;
    endScale = 1.2;
  } else if (distance < 30) {
    speedMin = 1 * Math.pow(2.1, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.2, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 1.8;
  } else if (distance < 40) {
    speedMin = 1 * Math.pow(2.3, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.4, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 1.8;
  } else if (distance < 50) {
    speedMin = 1 * Math.pow(2.4, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.5, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 60) {
    speedMin = 1 * Math.pow(2.6, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.7, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 70) {
    speedMin = 1 * Math.pow(2.7, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.85, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 80) {
    speedMin = 1 * Math.pow(2.8, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(2.9, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 100) {
    speedMin = 1 * Math.pow(3.0, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.1, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 120) {
    speedMin = 1 * Math.pow(3.1, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.2, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 140) {
    speedMin = 1 * Math.pow(3.2, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.35, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 160) {
    speedMin = 1 * Math.pow(3.3, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.4, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 3.0;
  } else if (distance < 170) {
    speedMin = 1 * Math.pow(3.45, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.55, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 3.0;
  } else if (distance < 180) {
    speedMin = 1 * Math.pow(3.55, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.65, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 190) {
    speedMin = 1 * Math.pow(3.60, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.70, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 200) {
    speedMin = 1 * Math.pow(3.6, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.7, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 220) {
    speedMin = 1 * Math.pow(3.7, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.8, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 240) {
    speedMin = 1 * Math.pow(3.8, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(3.9, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 260) {
    speedMin = 1 * Math.pow(3.9, parseInt(distance / minimumParticleLife));
    speedMax = 1 * Math.pow(4.0, parseInt(distance / minimumParticleLife)) + 0.5;
    pitch = Math.PI / 4;
    endScale = 4.0;
  }

  var emitterModelMatrix = new Cesium.Matrix4();
  var translation = new Cesium.Cartesian3();
  var rotation = new Cesium.Quaternion();
  var hpr = new Cesium.HeadingPitchRoll(angle, pitch, 0);
  var trs = new Cesium.TranslationRotationScale();

  function computeEmitterModelMatrix() {
    //喷泉位置
    trs.translation = Cesium.Cartesian3.fromElements(0, 0, offsetHeight, translation);
    trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

    return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
  }
  var that = this;
  let clock = this._viewer.clock;
  //设置重力
  function applyGravitys(particle, dt) {
    let position = particle.position;
    Cesium.Cartesian3.normalize(position, gravityScratch);
    Cesium.Cartesian3.multiplyByScalar(gravityScratch, gravity * dt, gravityScratch);
    particle.velocity = Cesium.Cartesian3.add(particle.velocity, gravityScratch, particle.velocity);
    if (particle && that._event) {
      let time = clock.currentTime;
      if (Cesium.JulianDate.lessThan(time, that._startTime) && Cesium.JulianDate.greaterThan(time, that._minimumTime)) {
        that._event.startColor = new Cesium.Color(0, 0, 0, 0.0);
        that._event.image = null;

        that._event.startScale = that._event.endScale = 0.01;
        // that._event.show = false;
      } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
        // that._event.emissionRate = that._emissionRate;
        // that._event.show = true;
        that._event.startScale = startScale
        that._event.image = image;
        that._event.startColor = new Cesium.Color(1, 1, 1, 0.6);
        that._event.endColor = new Cesium.Color(0.80, 0.86, 1, 0.4);
        that._event.endScale = endScale;
      } else if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
        // that._event.emissionRate = 0.001;
        // that._event.show = false;
        that._event.startScale = that._event.endScale = 0.01;
        that._event.image = null;
        // that._event.startColor = that._event.endColornew = new Cesium.Color(0, 0, 0, 0.0);
      }
    }
  }


  //添加粒子
  let event = new Cesium.ParticleSystem({
    image: image,
    startColor: new Cesium.Color(1, 1, 1, 0.6),
    endColor: new Cesium.Color(0.80, 0.86, 1, 0.4),
    startScale: 0.01,
    endScale: 0.01,
    show: true,
    minimumParticleLife: minimumParticleLife,
    maximumParticleLife: maximumParticleLife,
    minimumSpeed: speedMin,
    maximumSpeed: speedMax,
    imageSize: new Cesium.Cartesian2(3.6, 3.6),
    emissionRate: emissionRate,
    emitter: new Cesium.CircleEmitter(0.5),
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(positionOringon),//computeModelMatrix(entity, viewer.clock.currentTime),
    emitterModelMatrix: computeEmitterModelMatrix(),
    updateCallback: applyGravitys,
    // sizeInMeters: true,
    mass: this._mass || 300,
    sizeInMeters: this._sizeInMeters || true,
    loop: true
  })

  return event;

}


Object.defineProperties(PlanEvent, {
  positionOringon: {
    get: function () {
      return this._positionOringon;
    },
    set: function (value) {
      this._positionOringon = value;
      if (!this._event) {
        let event = this.addWaterEvent();
        if (event) {
          this._event = this._viewer.scene.primitives.add(event);
        }
      }
    }
  },
  positionEnd: {
    get: function () {
      return this._positionEnd;
    },
    set: function (value) {
      this._positionEnd = value;
      if (!this._event) {
        let event = this.addWaterEvent();
        if (event) {
          this._event = this._viewer.scene.primitives.add(event);
        }
      }
    }
  },
  emissionRate: {
    get: function () {
      return this._emissionRate;
    },
    set: function (value) {
      if (Cesium.defined(value)) {
        if (this._event) {
          this._event.emissionRate = value;
        }
      }
    }
  },
  startTime: {
    get: function () {
      return this._startTime;
    },
    set: function (value) {
      if (value) {
        this._startTime = value;
      }
    }
  },
  endTime: {
    get: function () {
      return this._endTime;
    },
    set: function (value) {
      if (value) {
        this._endTime = value;
      }
    }
  },
  eventType: {
    get: function () {
      return this._eventType;
    },
    set: function (value) {
      if (value) {
        this._eventType = value;
      }
    }
  },
  fireWorksLevelAngle: {
    get: function () {
      return this._fireWorksLevelAngle;
    },
    set: function (value) {
      this._fireWorksLevelAngle = value;

      var emitterModelMatrix = new Cesium.Matrix4();
      var translation = new Cesium.Cartesian3();
      var rotation = new Cesium.Quaternion();
      // var hpr = new Cesium.HeadingPitchRoll();
      var hpr = new Cesium.HeadingPitchRoll(this._fireWorksBearAngle, this._fireWorksLevelAngle, 0);
      var trs = new Cesium.TranslationRotationScale();

      function computeEmitterModelMatrix() {
        //喷泉位置
        trs.translation = Cesium.Cartesian3.fromElements(0, 0, 0.1, translation);
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

        return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
      }
      if (this._event) {
        this._event.emitterModelMatrix = computeEmitterModelMatrix();
      }
    }
  },
  fireWorksBearAngle: {
    get: function () {
      return this._fireWorksBearAngle;
    },
    set: function (value) {
      this._fireWorksBearAngle = value;

      var emitterModelMatrix = new Cesium.Matrix4();
      var translation = new Cesium.Cartesian3();
      var rotation = new Cesium.Quaternion();
      // var hpr = new Cesium.HeadingPitchRoll();
      var hpr = new Cesium.HeadingPitchRoll(this._fireWorksBearAngle, this._fireWorksLevelAngle, 0);
      var trs = new Cesium.TranslationRotationScale();

      function computeEmitterModelMatrix() {
        //喷泉位置
        trs.translation = Cesium.Cartesian3.fromElements(0, 0, 0.1, translation);
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

        return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
      }
      if (this._event) {
        this._event.emitterModelMatrix = computeEmitterModelMatrix();
      }
    }
  }
})


export default PlanEvent;
