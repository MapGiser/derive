import Complex from './com.js';
import planMode from './planMode.js';
import planManage from './planManage.js';
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
  this._singleMove = false;

  this._modelId = Cesium.defaultValue(options.modelId,null);

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

// ???????????????
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
    // var times = Cesium.JulianDate.secondsDifference(that._endTime, that._startTime);
    // var middleTime = Cesium.JulianDate.addSeconds(that._startTime, times / 2, new Cesium.JulianDate());
    // if (particle && that._event) {
    //   let time = that._viewer.clock.currentTime;
    //   if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
    //     that._event.startScale = that._event.endScale = 0.01;
    //     that._event.image = that._image;
    //     // that._event.startColor = that._event.endColornew = new Cesium.Color(0, 0, 0, 0.0);
    //   } else if (Cesium.JulianDate.lessThan(time, that._startTime)) {
    //     // that._event.startColor = new Cesium.Color(0, 0, 0, 0.0);
    //     // that._event.image = that._image;
    //     // that._event.startScale = that._event.endScale = 1.0;
    //   } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, middleTime)) {
    //     that._event.emissionRate = that._emissionRate || 180;
    //     that._event.startScale = startScale;
    //     that._event.image = that._image;
    //     that._event.endScale = endScale;
    //   } else if (Cesium.JulianDate.greaterThan(time, middleTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
    //     that._event.startScale = startScale;
    //     that._event.image = that._image;
    //     that._event.endScale = endScale;

    //     let emissionRate = ((that._endTime.secondsOfDay - time.secondsOfDay) / (that._endTime.secondsOfDay - middleTime.secondsOfDay))
    //     if (emissionRate < 0.1) emissionRate = 0.01;
    //     that._event.emissionRate = emissionRate * that._emissionRate;
    //   }
    // }
  }
  if (position) {
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    return new Cesium.ParticleSystem({
      modelMatrix: modelMatrix,
      speed: this._speed || 10,
      lifetime: 10,
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

PlanEvent.prototype.addFfireWorksEvent = function (options) {
  let position = this._position;

  var emitterModelMatrix = new Cesium.Matrix4();
  var translation = new Cesium.Cartesian3();
  var rotation = new Cesium.Quaternion();
  // var hpr = new Cesium.HeadingPitchRoll();
  var hpr = new Cesium.HeadingPitchRoll(this._fireWorksBearAngle, this._fireWorksLevelAngle, 0);
  var trs = new Cesium.TranslationRotationScale();

  let startScale = 2.0;
  let endScale = 3.0;

  function computeEmitterModelMatrix() {
    //????????????
    trs.translation = Cesium.Cartesian3.fromElements(0, 0, 0.1, translation);
    trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

    return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
  }

  let that = this;
  function applyGravity(particle, dt) {
    // var times = Cesium.JulianDate.secondsDifference(that._endTime, that._startTime);
    // var middleTime = Cesium.JulianDate.addSeconds(that._startTime, times / 2, new Cesium.JulianDate());
    // if (particle) {
    //   let time = that._viewer.clock.currentTime;
    //   if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
    //     that._event.startScale = that._event.endScale = 0.01;
    //     // that._event.image = that._image;
    //     // that._event.startColor = that._event.endColornew = new Cesium.Color(0, 0, 0, 0.0);
    //   } else if (Cesium.JulianDate.lessThan(time, that._startTime)) {
    //     // that._event.startColor = new Cesium.Color(0, 0, 0, 0.0);
    //     // that._event.image = null;
    //     // that._event.startScale = that._event.endScale = 0.01;
    //   } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
    //     // that._event.emissionRate = that._emissionRate || 180;
    //     that._event.startScale = startScale;
    //     // that._event.image = that._image;
    //     that._event.endScale = endScale;
    //   }
    //   else if (Cesium.JulianDate.greaterThan(time, middleTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
    //     // that._event.startScale = startScale;
    //     // that._event.image = that._image;
    //     // that._event.endScale = endScale;

    //     // let emissionRate = ((that._endTime.secondsOfDay - time.secondsOfDay) / (that._endTime.secondsOfDay - middleTime.secondsOfDay))
    //     // if (emissionRate < 0.1) emissionRate = 0.01;
    //     // that._event.emissionRate = emissionRate * that._emissionRate;
    //   }
    // }
  }

  if (position) {
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    return new Cesium.ParticleSystem({
      image: './static/data/img/smoke.png',
      modelMatrix: modelMatrix,
      show: true,
      startColor: options.startColor || Cesium.Color.fromCssColorString('#c98d33').withAlpha(0.5),
      endColor: options.endColor || Cesium.Color.BLACK.withAlpha(0.15),
      startScale: options.startScale || 2.0,
      endScale: options.endScale || 3.0,
      // minimumParticleLife: options.minimumParticleLife || 1.2,
      // maximumParticleLife: options.maximumParticleLife || 3.1,
      minimumSpeed: options.minimumSpeed || 3.0,
      maximumSpeed: options.maximumSpeed || 5.0,
      imageSize: options.imageSize || new Cesium.Cartesian2(2.0, 2.0),
      emissionRate: options.emissionRate || 3.0,
      // bursts: [
      //   // these burst will occasionally sync to create a multicolored effect
      //   new Cesium.ParticleBurst({ time: 5.0, minimum: 1, maximum: 10 }),
      //   new Cesium.ParticleBurst({ time: 10.0, minimum: 3, maximum: 5 }),
      //   new Cesium.ParticleBurst({ time: 15.0, minimum: 2, maximum: 1 })
      // ],
      lifetime: 25.0,
      emitter: new Cesium.CircleEmitter(1.0),
      sizeInMeters: true,
      emitterModelMatrix: computeEmitterModelMatrix(),
      // updateCallback: this._updateCallback || applyGravity,
    })
  }

}

PlanEvent.prototype.addBillBoard = function () {
  let viewer = this._viewer;
  let options = {
    text: '',
    font: "16px sans-serif",
    pixelOffset: new Cesium.Cartesian2(3, 3),
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0.0, -50),
    eyeOffset: new Cesium.Cartesian3(0, 0, -30),
    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    fillColor: Cesium.Color.CYAN,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(15.0, 1500.0),
    showBackground: true
  }
  let label = new Cesium.LabelGraphics(options);
  label = viewer.entities.add({
    label: label,
    position: this.positionOringon,
    show: false
  })
  this._label = label
}

PlanEvent.prototype.addWaterEvent = function () {
  let positionOringon = this._positionOringon.clone();//pos1
  let positionEnd = this._positionEnd.clone();//pos3
  if (!positionOringon || !positionEnd) return;
  this.addBillBoard();
  let offsetHeight = this._offsetHeight || 3.4;
  let image = this._image || './static/data/img/pq.png';
  let emissionRate = 120// || 50;
  let startScale = this._startScale || 1;
  let endScale = this._endScale || 1;
  let gravity = -1;
  let angle = this.computerAzimuth(positionOringon, positionEnd);//?????????
  let gravityScratch = new Cesium.Cartesian3();

  //????????????
  let distance = Cesium.Cartesian3.distance(positionOringon, positionEnd);
  let minimumParticleLife = distance / 2;
  let maximumParticleLife = distance / 2;
  let speedMin, speedMax, pitch;
  //????????????????????????????????????????????????????????????
  if (distance < 10) {
    speedMin = 2.0;
    speedMax = 2.5;
    pitch = Math.PI / 3;
    startScale = 0.6;
    endScale = 0.5;
    minimumParticleLife = maximumParticleLife = 15.0;
    // emissionRate = 20.0;
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
    //????????????
    trs.translation = Cesium.Cartesian3.fromElements(0, 0, offsetHeight, translation);
    trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

    return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
  }
  var that = this;
  let viewer = this._viewer;
  let clock = this._viewer.clock;
  //????????????
  function applyGravitys(particle, dt) {
    let position = particle.position;
    Cesium.Cartesian3.normalize(position, gravityScratch);
    Cesium.Cartesian3.multiplyByScalar(gravityScratch, gravity * dt, gravityScratch);
    particle.velocity = Cesium.Cartesian3.add(particle.velocity, gravityScratch, particle.velocity);

    // if (particle && that._event) {
    //   let time = clock.currentTime;
    //   if (Cesium.JulianDate.lessThan(time, that._startTime) && Cesium.JulianDate.greaterThan(time, that._minimumTime)) {
    //     // that._event.startColor = new Cesium.Color(0, 0, 0, 0.0);
    //     // that._event.image = null;
    //     // if (that._label) {
    //     //   that._label.show = false;
    //     // }
    //     // that._event.startScale = that._event.endScale = 0.01;
    //     // that._event.show = false;
    //   } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
    //     // that._event.emissionRate = that._emissionRate;
    //     // that._event.show = true;
    //     // if (that._label) {
    //     //   that._label.show = true;
    //     //   that._label.label.text = '????????????'
    //     // }

    //     // that._event.startScale = startScale
    //     // that._event.image = image;
    //     // that._event.startColor = new Cesium.Color(1, 1, 1, 0.6);
    //     // that._event.endColor = new Cesium.Color(0.80, 0.86, 1, 0.4);
    //     // that._event.endScale = endScale;
    //   } else if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
    //     // that._event.emissionRate = 0.001;
    //     // that._event.show = false;
    //     // that._event.startScale = that._event.endScale = 0.01;
    //     // that._event.image = null;
    //     // if (that._label) {
    //     //   that._label.label.text = '????????????';
    //     //   that._label.show = false;
    //     // }
    //     // that._event.startColor = that._event.endColornew = new Cesium.Color(0, 0, 0, 0.0);
    //   }
    // }
    // })
  }

  //????????????
  let event = new Cesium.ParticleSystem({
    image: image,
    startColor: new Cesium.Color(1, 1, 1, 0.6),
    endColor: new Cesium.Color(0.80, 0.86, 1, 0.4),
    startScale: startScale,//0.01,
    endScale: endScale,//0.01,
    show: false,
    minimumParticleLife: minimumParticleLife,
    lifetime: minimumParticleLife + maximumParticleLife,
    maximumParticleLife: maximumParticleLife,
    minimumSpeed: speedMin,
    maximumSpeed: speedMax,
    imageSize: new Cesium.Cartesian2(3.6, 3.6),
    emissionRate: emissionRate,
    emitter: new Cesium.CircleEmitter(0.5),
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(positionOringon),//computeModelMatrix(entity, viewer.clock.currentTime),
    emitterModelMatrix: computeEmitterModelMatrix(),
    updateCallback: applyGravitys,
    sizeInMeters: true,
    // mass: this._mass || 300,
    // sizeInMeters: this._sizeInMeters || true,
    // loop: true
  })
  return event;
}

PlanEvent.prototype.play = function () {
  let viewer = this._viewer;
  let clock = viewer.clock;
  let that = this;
  var showWaterParticle = function () {
    let time = clock.currentTime;
    if (that._event) {
      if (that._singleMove) {
        that._event.show = false;
      } else {
        if (Cesium.JulianDate.lessThan(time, that._startTime) && Cesium.JulianDate.greaterThan(time, that._minimumTime)) {
          if (that._label) {
            that._label.show = false;
          }
          that._event.show = false;
        } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
          if (that._label) {
            that._label.show = true;
            that._label.label.text = '????????????'
          }
          that._event.show = true;
        } else if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
          if (that._label) {
            that._label.label.text = '????????????';
            that._label.show = false;
          }
          that._event.show = false;
          that._event.twzdEvent = undefined;
        }
      }

    }
  }

  var showFireParticle = function () {
    var times = Cesium.JulianDate.secondsDifference(that._endTime, that._startTime);
    var middleTime = Cesium.JulianDate.addSeconds(that._startTime, times / 2, new Cesium.JulianDate());
    if (that._event) {
      let time = clock.currentTime;
      if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
        that._event.show = false;
        that._event.twzdEvent = undefined
      } else if (Cesium.JulianDate.lessThan(time, that._startTime)) {
        that._event.show = true;
      } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, middleTime)) {
        that._event.emissionRate = that._emissionRate || 180;
        that._event.show = true;
      } else if (Cesium.JulianDate.greaterThan(time, middleTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
        let emissionRate = ((that._endTime.secondsOfDay - time.secondsOfDay) / (that._endTime.secondsOfDay - middleTime.secondsOfDay))
        if (emissionRate < 0.1) emissionRate = 0.01;
        that._event.emissionRate = emissionRate * that._emissionRate;
      }
    }
  }

  var showFireWorksParticle = function () {
    if (that._event) {
      if (that._singleMove) {
        that._event.show = false;
      } else {
        let time = clock.currentTime;
        if (Cesium.JulianDate.greaterThan(time, that._endTime)) {
          that._event.show = false
          that._event.twzdEvent = undefined
        } else if (Cesium.JulianDate.lessThan(time, that._startTime)) {
          that._event.show = true
        } else if (Cesium.JulianDate.greaterThan(time, that._startTime) && Cesium.JulianDate.lessThan(time, that._endTime)) {
          that._event.show = true
        }
      }
    }
  }

  if (this._event) { 
    if (this._eventType === 2) {
      this._event.twzdEvent = showWaterParticle;
    } else if (this._eventType === 0) {
      this._event.twzdEvent = showFireParticle;
    } else if (this._eventType === 1) {
      this._event.twzdEvent = showFireWorksParticle;
    }
  }
}

PlanEvent.prototype.addExplodeEvent = function (options) {
  let position = this._position
  if (position) {
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    let emitterModelMatrixScratch = new Cesium.Matrix4();
    //????????????
    position = Cesium.Cartesian3.add(new Cesium.Cartesian3(0.0, 0.0, 0.0), new Cesium.Cartesian3(0.2, 0.1, 0.1), new Cesium.Cartesian3());
    //??????????????????(????????????)
    var emitterModelMatrix = Cesium.Matrix4.fromTranslation(position, emitterModelMatrixScratch);
    // ??????????????????????????????????????????
    var particleToWorld = Cesium.Matrix4.multiply(modelMatrix, emitterModelMatrix, new Cesium.Matrix4());
    // ??????????????????????????????
    var worldToParticle = Cesium.Matrix4.inverseTransformation(particleToWorld, particleToWorld);
    // ??????????????????????????????
    var size = Cesium.Math.randomBetween(1.6, 1.7);
    var particlePositionScratch = new Cesium.Cartesian3();
    //????????????
    var normalSize = size;
    var minLife = 4.3;
    var maxLife = 5.0;
    //????????????????????????  0-----1??????
    var life = normalSize * (maxLife - minLife) + minLife;
    // ????????????
    var bursts = [];
    bursts.push(new Cesium.ParticleBurst({
      time: 2.2,//Cesium.Math.nextRandomNumber() * 16.0,
      minimum: 2.0,
      maximum: 2.0 * 2.5
    }));
    var force = function (particle) {
      //????????????????????????????????????????????????
      var position = Cesium.Matrix4.multiplyByPoint(worldToParticle, particle.position, particlePositionScratch);
      if (Cesium.Cartesian3.magnitudeSquared(position) >= size * size) {
        Cesium.Cartesian3.clone(Cesium.Cartesian3.ZERO, particle.velocity);
      }
    };
    return new Cesium.ParticleSystem({
      startColor: options.startColor || Cesium.Color.BLACK.withAlpha(0.65),
      endColor: options.endColor || Cesium.Color.fromCssColorString('#c98d33').withAlpha(0.15),
      image: './static/data/img/smoke.png',
      particleLife: life,
      speed: 15.0,
      show: true,
      imageSize: new Cesium.Cartesian2(3, 4),
      emissionRate: 0,
      emitter: new Cesium.SphereEmitter(2.0),
      bursts: bursts,
      lifetime: 5.0,
      updateCallback: force,
      // bursts: [
      //   // these burst will occasionally sync to create a multicolored effect
      //   new Cesium.ParticleBurst({ time: 5.0, minimum: 1, maximum: 10 }),
      //   new Cesium.ParticleBurst({ time: 10.0, minimum: 3, maximum: 5 }),
      //   new Cesium.ParticleBurst({ time: 15.0, minimum: 2, maximum: 1 })
      // ],
      modelMatrix: modelMatrix,
      emitterModelMatrix: emitterModelMatrix,
      sizeInMeters: true
    })

  }
}


Object.defineProperties(PlanEvent.prototype, {
  modelId:{
    get:function(){
      return this._modelId
    },
    set:function(value){
      this._modelId = value
    }
  },
  singleMove:{
    get:function(){
      return this._singleMove;
    },
    set:function(value){
      this._singleMove = value;
    }
  },
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
        //????????????
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
        //????????????
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
