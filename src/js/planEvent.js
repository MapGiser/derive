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
}

PlanEvent.prototype.addEvent = function (options) {
  let viewer = this._viewer;
  let eventType = options.eventType;
  if (typeof (eventType) != "undefined" && eventType != null) {
    let event = this.addEventByEventType(options);
    if (event) {
      this.event = viewer.scene.primitives.add(event);
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
        event = this.addFireEvent(options);
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

PlanEvent.prototype.addFireEvent = function (options) {
  let position = options.position;
  if (position) {
    this._position = position;
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    return new Cesium.ParticleSystem({
      modelMatrix: modelMatrix,
      speed: options.speed || 15,
      lifetime: options.lifetime || 0.8,
      particleLife: 0.5,
      show: false,
      emitter: options.emitter || new Cesium.ConeEmitter(Cesium.Math.toRadians(55.0)),//new Cesium.BoxEmitter(new Cesium.Cartesian3(0.9,1.5,1.9)),
      image: options.image || './static/data/img/fire.png',
      emissionRate: options.emissionRate || 180.0,
      startColor: options.startColor || Cesium.Color.fromCssColorString('#ffffff'),
      endColor: options.endColor || Cesium.Color.fromCssColorString('#ffa000').withAlpha(0.6),
      imageSize: options.imageSize || new Cesium.Cartesian2(5, 2.5),
      updateCallback: options.updateCallback || null,
      loop: options.loop || true,
      show: options.show || true,
      mass: options.mass || 300,
      sizeInMeters: options.sizeInMeters || true
    });
  }
}

PlanEvent.prototype.addFfireWorksEvent = function (options) {
  let position = options.position;
  if (position) {
    this._position = position;
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    return new Cesium.ParticleSystem({
      image: './static/data/img/smoke.png',
      modelMatrix: modelMatrix,
      show: false,
      startColor: options.startColor || Cesium.Color.fromCssColorString('#c98d33').withAlpha(0.7),
      endColor: options.endColor || Cesium.Color.BLACK.withAlpha(0.05),
      startScale: options.startScale || 2.0,
      endScale: options.endScale || 4.0,
      minimumParticleLife: options.minimumParticleLife || 1.2,
      maximumParticleLife: options.maximumParticleLife || 3.1,
      minimumSpeed: options.maximumParticleLife || 3.0,
      maximumSpeed: options.maximumParticleLife || 10.0,
      imageSize: options.imageSize || new Cesium.Cartesian2(5.0, 5.0),
      emissionRate: options.imageSize || 6.0,
      bursts: [
        // these burst will occasionally sync to create a multicolored effect
        new Cesium.ParticleBurst({ time: 5.0, minimum: 1, maximum: 10 }),
        new Cesium.ParticleBurst({ time: 10.0, minimum: 5, maximum: 10 }),
        new Cesium.ParticleBurst({ time: 15.0, minimum: 10, maximum: 10 })
      ],
      lifetime: 10.0,
      emitter: new Cesium.CircleEmitter(2.0),
      sizeInMeters: true
    })
  }
}

PlanEvent.prototype.addExplodeEvent = function (options) {
  let position = options.position;
  if (position) {
    this._position = position;
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    let emitterModelMatrixScratch = new Cesium.Matrix4();
    //计算偏移
    position = Cesium.Cartesian3.add(new Cesium.Cartesian3(0.0, 0.0, 0.0), new Cesium.Cartesian3(0.2, 0.1, 0.1), new Cesium.Cartesian3());
    //计算偏移矩阵(世界坐标)
    var emitterModelMatrix = Cesium.Matrix4.fromTranslation(position, emitterModelMatrixScratch);
    // 粒子偏移后的矩阵（世界坐标）
    var particleToWorld = Cesium.Matrix4.multiply(modelMatrix, emitterModelMatrix, new Cesium.Matrix4());
    // 计算偏移坐标的逆矩阵
    var worldToParticle = Cesium.Matrix4.inverseTransformation(particleToWorld, particleToWorld);
    // 计算粒子大小的随机数
    var size = Cesium.Math.randomBetween(1.6, 1.7);
    var particlePositionScratch = new Cesium.Cartesian3();
    //粒子大小
    var normalSize = size;
    var minLife = 1.3;
    var maxLife = 2.0;
    //计算生命周期比例  0-----1之间
    var life = normalSize * (maxLife - minLife) + minLife;
    // 添加粒子
    var bursts = [];
    bursts.push(new Cesium.ParticleBurst({
      time: 2.2,//Cesium.Math.nextRandomNumber() * 16.0,
      minimum: 2.0,
      maximum: 2.0 * 1.5
    }));
    var force = function (particle) {
      //根据粒子的位置计算偏移的局部坐标
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
      speed: 50.0,
      show: false,
      imageSize: new Cesium.Cartesian2(5, 4),
      emissionRate: 0,
      emitter: new Cesium.SphereEmitter(1.5),
      bursts: bursts,
      lifetime: 5.0,
      updateCallback: force,
      modelMatrix: modelMatrix,
      emitterModelMatrix: emitterModelMatrix,
      sizeInMeters: true
    })

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

PlanEvent.prototype.addWaterEvent = function (options) {
  let viewer = this._viewer;
  let positionOringon = options.positionOringon;//pos1
  let positionEnd = options.positionEnd;//pos3
  this._positionOringon = positionOringon;
  this._positionEnd = positionEnd;
  if (!positionOringon || !positionEnd) return;
  let offsetHeight = options.offsetHeight || 3.4;
  let image = options.image || './static/data/img/pq.png';
  let emissionRate = options.emissionRate || 50;
  let startScale = options.startScale || 1;
  let endScale = options.endScale || 1;
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

  //设置重力
  function applyGravity(p, dt) {
    var position = p.position;
    Cesium.Cartesian3.normalize(position, gravityScratch);
    Cesium.Cartesian3.multiplyByScalar(gravityScratch, gravity * dt, gravityScratch);

    p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);
  }


  //添加粒子
  return new Cesium.ParticleSystem({
    image: image,
    startColor: new Cesium.Color(1, 1, 1, 0.6),
    endColor: new Cesium.Color(0.80, 0.86, 1, 0.4),
    startScale: startScale,
    endScale: endScale,
    show: false,
    minimumParticleLife: minimumParticleLife,
    maximumParticleLife: maximumParticleLife,
    minimumSpeed: speedMin,
    maximumSpeed: speedMax,
    imageSize: new Cesium.Cartesian2(3.6, 3.6),
    emissionRate: emissionRate,
    emitter: new Cesium.CircleEmitter(0.5),
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(positionOringon),//computeModelMatrix(entity, viewer.clock.currentTime),
    emitterModelMatrix: computeEmitterModelMatrix(),
    updateCallback: applyGravity,
    sizeInMeters: true
  })

}

export default PlanEvent;
