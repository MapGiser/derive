import Complex from './com.js';
import planManageMode from './planManageMode.js';
function PlanManagement(options) {
  if (!options.viewer) {
    console.error('viewer is required!')
  }
  this._viewer = options.viewer;
  this._eventType = Cesium.defaultValue(options.eventType, null);
  this._eventCollections = Cesium.defaultValue(options.eventCollections, []);
  this._eventManage = Cesium.defaultValue(options.eventManage, []);
}

PlanManagement.prototype.addEventCollection = function (events) {
  this._eventManage.length = 0;
  if (events) {
    for (let i = 0; i < events.length; i++) {
      let eventType = events[i].type;
      let event = this.addEvent(eventType);
      this._eventManage.push({
        type: eventType,
        event: event
      }
      )
    }
  }
}
PlanManagement.prototype.addEvent = function (eventType) {
  var viewer = this.viewer;
  if (typeof (eventType) != undefined && typeof (eventType) != null) {
    let event = this.addEventByEventType(eventType);
    if (event) {
      this.event = viewer.scene.primitives.add(event);
      this.event.show = false;
      return this.event;
    }
  }
}

PlanManagement.prototype.addEventByEventType = function (eventType) {
  if (typeof (eventType) != undefined && typeof (eventType) != null) {
    let event = null;
    switch (eventType) {
      case planManageMode.fire:
        event = this.addFireEvent({});
        break;
      case planManageMode.fireworks:
        event = this.addFfireWorksEvent();
        break;
      case planManageMode.water:
        event = this.addWaterEvent();
        break;
    }
    return event;
  }
}

PlanManagement.prototype.addFireEvent = function (options) {
  let position = this._positions[this._positions.length - 1];
  if (position) {
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    return new Cesium.ParticleSystem({
      modelMatrix: modelMatrix,
      speed: options.speed || 15,
      lifetime: options.lifetime || 0.8,
      particleLife: 0.5,
      emitter: options.emitter || new Cesium.ConeEmitter(Cesium.Math.toRadians(35.0)),
      image: options.image || './static/data/img/fire.png',
      emissionRate: options.emissionRate || 100.0,
      startColor: options.startColor || Cesium.Color.fromCssColorString('#ffffff'),
      endColor: options.endColor || Cesium.Color.fromCssColorString('#ffa000'),
      imageSize: options.imageSize || new Cesium.Cartesian2(2.5, 5),
      updateCallback: options.updateCallback || null,
      loop: options.loop || true,
      show: options.show || true,
      mass: options.mass || 10,
      sizeInMeters: options.sizeInMeters || true
    });
  }
}
PlanManagement.prototype.addFireEvent = function (options) {
  let position = this._positions[this._positions.length - 1];
  if (position) {

  }




}
PlanManagement.prototype.addWaterEvent = function (options) {
  let viewer = this._viewer;
  var tileset = new Cesium.Cesium3DTileset({
    url: 'http://oa.kqgeo.com:20231/Examples/examples/data/3dtiles/pengquan/tileset.json'
  });
  viewer.scene.primitives.add(tileset);

  tileset.readyPromise.then(function (tileset) {
    var heightOffset = 0.2;
    var boundingSphere = tileset.boundingSphere;
    var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  })
  //计算粒子系统选装角度（喷射方向）
  var pos1 = Cesium.Cartesian3.fromDegrees(116.40688944653998, 39.876913666893915, 5);
  var pos2 = Cesium.Cartesian3.fromDegrees(116.40678944653998, 39.876913666893915, 5);
  var pos3 = Cesium.Cartesian3.fromDegrees(116.40738944653998, 39.875013666893915, 10);

  var distance = Cesium.Cartesian3.distance(pos1, pos3);

  var minimumParticleLife = distance / 2;
  var maximumParticleLife = distance / 2;
  var startScale, endScale;
  startScale = 1.0;
  var emissionRate = 50.0;
  var gravity = -1;
  // var speedxmin = distance / 2
  // var speedxmax = distance / 2 + 1
  if (distance < 10) {
    var speedMin = 2.0;//1 * Math.pow(1.4, parseInt(distance / minimumParticleLife));
    var speedMax = 2.5;//1 * Math.pow(1.5, parseInt(distance / minimumParticleLife)) + 1;
    var pitch = Math.PI / 3;
    startScale = 0.6;
    endScale = 0.5;
    minimumParticleLife = maximumParticleLife = 15.0;
    emissionRate = 20.0;
  } else if (distance < 20) {
    var speedMin = 3.0;//1 * Math.pow(1.4, parseInt(distance / minimumParticleLife));
    var speedMax = 4.0;//1 * Math.pow(1.5, parseInt(distance / minimumParticleLife)) + 1;
    var pitch = Math.PI / 3;
    endScale = 1.2;
  } else if (distance < 30) {
    var speedMin = 1 * Math.pow(2.1, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(2.2, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 1.8;
  } else if (distance < 40) {
    var speedMin = 1 * Math.pow(2.3, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(2.4, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 1.8;
  } else if (distance < 50) {
    var speedMin = 1 * Math.pow(2.4, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(2.5, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 60) {
    var speedMin = 1 * Math.pow(2.6, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(2.7, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 70) {
    var speedMin = 1 * Math.pow(2.7, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(2.85, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 80) {
    var speedMin = 1 * Math.pow(2.8, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(2.9, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 100) {
    var speedMin = 1 * Math.pow(3.0, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.1, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 120) {
    var speedMin = 1 * Math.pow(3.1, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.2, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 140) {
    var speedMin = 1 * Math.pow(3.2, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.35, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 2.0;
  } else if (distance < 160) {
    var speedMin = 1 * Math.pow(3.3, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.4, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 3.0;
  } else if (distance < 170) {
    var speedMin = 1 * Math.pow(3.45, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.55, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 3.0;
  } else if (distance < 180) {
    var speedMin = 1 * Math.pow(3.55, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.65, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 190) {
    var speedMin = 1 * Math.pow(3.60, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.70, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 200) {
    var speedMin = 1 * Math.pow(3.6, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.7, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 220) {
    var speedMin = 1 * Math.pow(3.7, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.8, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 240) {
    var speedMin = 1 * Math.pow(3.8, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(3.9, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 4.0;
  } else if (distance < 260) {
    var speedMin = 1 * Math.pow(3.9, parseInt(distance / minimumParticleLife));
    var speedMax = 1 * Math.pow(4.0, parseInt(distance / minimumParticleLife)) + 0.5;
    var pitch = Math.PI / 4;
    endScale = 4.0;
  }

  var ph1 = Cesium.Cartographic.fromCartesian(pos1);
  var ph2 = Cesium.Cartographic.fromCartesian(pos3);

  var lon1 = ph1.longitude / Math.PI * 180;
  var lat1 = ph1.latitude / Math.PI * 180;

  var lon2 = ph2.longitude / Math.PI * 180;
  var lat2 = ph2.latitude / Math.PI * 180;

  var angle = Complex(lat1, lon1, lat2, lon2);
  angle = angle / 180 * Math.PI;
  angle = angle + Math.PI / 2;


  var emitterModelMatrix = new Cesium.Matrix4();
  var translation = new Cesium.Cartesian3();
  var rotation = new Cesium.Quaternion();
  var hpr = new Cesium.HeadingPitchRoll();
  var hpr = new Cesium.HeadingPitchRoll(angle, pitch, 0);
  var trs = new Cesium.TranslationRotationScale();
  var offsetHeight = 3.4;

  function computeEmitterModelMatrix() {
    //喷泉位置
    trs.translation = Cesium.Cartesian3.fromElements(0, 0, offsetHeight, translation);
    trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

    return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
  }

  var entity = viewer.entities.add({
    position: pos1,
    point: {
      pixelSize: 10,
      color: Cesium.Color.PINK,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(5, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }
  });
  var entity2 = viewer.entities.add({
    position: pos2,
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(5, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }
  });
  var entity3 = viewer.entities.add({
    position: pos3,
    point: {
      pixelSize: 10,
      color: Cesium.Color.YELLOW,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(5, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }
  });


  var viewModel = {
    emissionRate: emissionRate,
    gravity: gravity,
    minimumParticleLife: minimumParticleLife,
    maximumParticleLife: maximumParticleLife,
    minimumSpeed: speedMin,
    maximumSpeed: speedMax,
    startScale: startScale,
    endScale: endScale,
    particleSize: 3.6,
  };
  //添加粒子
  var particleSystem = viewer.scene.primitives.add(new Cesium.ParticleSystem({
    image: './static/data/img/pq.png',
    startColor: new Cesium.Color(1, 1, 1, 0.6),
    endColor: new Cesium.Color(0.80, 0.86, 1, 0.4),
    startScale: viewModel.startScale,
    endScale: viewModel.endScale,
    minimumParticleLife: viewModel.minimumParticleLife,
    maximumParticleLife: viewModel.maximumParticleLife,
    minimumSpeed: viewModel.minimumSpeed,
    maximumSpeed: viewModel.maximumSpeed,
    imageSize: new Cesium.Cartesian2(viewModel.particleSize, viewModel.particleSize),
    emissionRate: viewModel.emissionRate,
    // lifetime: 16.0,
    //粒子发射器
    emitter: new Cesium.CircleEmitter(0.5),
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(pos1),//computeModelMatrix(entity, viewer.clock.currentTime),
    emitterModelMatrix: computeEmitterModelMatrix(),
    updateCallback: applyGravity,
    sizeInMeters: true
  }));


  var gravityScratch = new Cesium.Cartesian3();
  //设置重力
  function applyGravity(p, dt) {
    var position = p.position;
    Cesium.Cartesian3.normalize(position, gravityScratch);
    Cesium.Cartesian3.multiplyByScalar(gravityScratch, viewModel.gravity * dt, gravityScratch);

    p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);
  }


  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.40689619519765, 39.876489734810534, 50.25979719236855),
    orientation: {
      heading: Cesium.Math.toRadians(358.3427926550179),
      pitch: Cesium.Math.toRadians(-52.50529304678685),
      roll: Cesium.Math.toRadians(359.99096998079574)
    }
  });

}

export default PlanManagement;
