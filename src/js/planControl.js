import planManage from './planManage.js'
import planMode from './planMode.js'
function planControl(options) {
  if (!options.viewer) {
    console.error('viewer is required!');
  }
  this._viewer = options.viewer;
  this._startTime = options.startTime;
  this._endTime = options.endTime;
  this._clockRange0 = this._viewer.clock.clockRange;
  this._multiplier0 = this._viewer.clock.multiplier;
  this._currentTime0 = this._viewer.clock.currentTime;
  this._viewer.clock.multiplier = 0.01;
  if (this._startTime && this._endTime) {
    let timeSeconds = Cesium.JulianDate.secondsDifference(this._endTime, this._startTime);
    let middleTime = Cesium.JulianDate.addSeconds(this._startTime, timeSeconds / 2, new Cesium.JulianDate());
    this._middleTime = Cesium.defaultValue(options.middleTime, middleTime);
  }
  this._planManage = new planManage();

}

planControl.prototype.addEvent = function (options) {
  this._viewer.clock.multiplier = 0.01;
  this._copyOptions = Object.assign(options, this);
  this._planManage.add(options);
  // this.render();
}

planControl.prototype.render = function () {
  let viewer = this._viewer;
  let modelCollection = this._planManage._modelCollection;
  let eventCollection = this._planManage._eventCollection;
  let voiceCollection = this._planManage._voiceCollection;
  // let pathCollection = this._planManage._pathCollection;
  let targetEvent, originEvent, emission, middleBeforeTime;
  if (eventCollection && eventCollection.length > 0) {
    targetEvent = eventCollection.filter((item) => {
      return (item.eventType === planMode.fire || item.eventType === planMode.fireworks || item.eventType === planMode.explode)
    })

    originEvent = eventCollection.filter((item) => {
      return (item.eventType === planMode.water)
    })
  }


  let that = this;
  if (targetEvent) {
    emission = targetEvent[0].event.emissionRate;
  }
  if (that._middleTime) {
    middleBeforeTime = Cesium.JulianDate.addSeconds(that._middleTime, -2, new Cesium.JulianDate());
  }
  let listenser = function () {

    if (viewer.clock.currentTime >= that._endTime) {
      targetEvent.forEach(item => {
        item.event.show = false;
      })

      originEvent.forEach(item => {
        item.event.show = false;
      })


      viewer.clock.multiplier = 0;
      viewer.scene.preRender.removeEventListener(listenser);
    } else if (viewer.clock.currentTime >= that._startTime && viewer.clock.currentTime < middleBeforeTime) {
      if (originEvent) {
        originEvent.forEach(item => {
          item.event.show = false;
        })
      }
      if (targetEvent) {
        targetEvent.forEach(item => {
          item.event.show = true;
        })
      }
      if (modelCollection) {
        modelCollection.forEach(item => {
          let model = item.model;
          if (model) {
            model.orientation = item.orientation;
          }
        })
      }

    } else if (viewer.clock.currentTime >= middleBeforeTime && viewer.clock.currentTime < that._middleTime) {
      
      modelCollection.forEach(item => {
        let model = item.model;
        if (model) {
          model.orientation = item.endOrition;
        }
      })
    } else if (viewer.clock.currentTime >= that._middleTime && viewer.clock.currentTime < that._endTime) {
      originEvent.forEach(item => {
        item.event.show = true;
      })

      targetEvent.forEach(item => {
        let emissionRate = ((that._endTime.secondsOfDay - viewer.clock.currentTime.secondsOfDay) / (that._endTime.secondsOfDay - that._middleTime.secondsOfDay)) //* item.event.emissionRate;
        if (emissionRate < 0.1) emissionRate = 0;
        item.event.emissionRate = emission * emissionRate;
      })
    }


    // voiceCollection.forEach(item => {
    //   let startTime = item.startTime;
    //   if (viewer.clock.currentTime >= startTime) {
    //     item.speak();
    //   }
    // })
  }
  if (viewer.scene.preRender._listeners.indexOf(listenser) > -1) {
    viewer.scene.preRender.removeEventListener(listenser);
  }

  viewer.scene.preRender.addEventListener(listenser);
}

planControl.prototype.rePlay = function () {
  let viewer = this._viewer;
  if (viewer.clock.currentTime > this._middleTime) {
    let eventCollection = this._planManage._eventCollection;
    let pathCollection = this._planManage._pathCollection;
    let modelCollection = this._planManage._modelCollection;
    eventCollection.forEach(item => {
      let event = item.event;
      if (event) {
        if (item.eventType === 2) {
          event.show = false;
        } else {
          event.show = true;
        }
        event.emissionRate = item.emissionRate;
      }

    })
    modelCollection.forEach(item => {
      let model = item.model;
      if (model) {
        model.orientation = item.orientation;
      }

    })
    pathCollection.forEach(item => {
      let path = item.path;
      if (path) path.show = true;
      item.position = null;
    })
  }
  this.play();

}
planControl.prototype.play = function () {
  let viewer = this._viewer;
  viewer.clock.multiplier = this._multiplier0;
  viewer.clock.currentTime = this._startTime;
  this.render();
}
planControl.prototype.pause = function () {
  let viewer = this._viewer;
  viewer.clock.multiplier = 0;
}
planControl.prototype.start = function () {
  let viewer = this._viewer;
  viewer.clock.multiplier = this._multiplier0;
}
planControl.prototype.reset = function () {
  let viewer = this._viewer;
  viewer.clock.multiplier = 0;
  viewer.clock.currentTime = this._startTime;
}
planControl.prototype.destory = function () {
  let viewer = this._viewer;
  this.remove();
  viewer.clock.clockRange = this._clockRange0;
  viewer.clock.multiplier = this._multiplier0;
  viewer.clock.currentTime = this._currentTime0;
  // this._planManage = undefined;
  // this._copyOptions = undefined;
  return this.isDestory = true;
}
planControl.prototype.remove = function () {
  let viewer = this._viewer;
  let modelCollection = this._planManage._modelCollection;
  let eventCollection = this._planManage._eventCollection;
  let voiceCollection = this._planManage._voiceCollection;
  let pathCollection = this._planManage._pathCollection;

  modelCollection.forEach(item => {
    let model = item.model;
    viewer.entities.remove(model);
  })

  eventCollection.forEach(item => {
    let event = item.event;
    viewer.scene.primitives.remove(event);
  })
  pathCollection.forEach(item => {
    let path = item.path;
    viewer.entities.remove(path);
    item.position = null;
  })
  voiceCollection.forEach(item => {
    item.voiceText = null;
  })
}

planControl.prototype.fromJSON = function (jsonFile) {
  let that = this;
  if (jsonFile) {

    Cesium.Resource.fetchJson(jsonFile).then(function (val) {
      if (val) {
        let modelCollection = val.modelCollection;
        let eventCollection = val.eventCollection;
        let pathCollection = val.pathCollection;
        let voiceCollection = val.voiceCollection;
        let p;


        if (modelCollection) {
          modelCollection.forEach(item => {
            let startTime = item.startTime;
            let endTime = item.endTime;
            let modelPath = item.modelPath;
            let position = item.position;
            if (startTime) {
              startTime = new Cesium.JulianDate.fromDate(new Date(startTime), new Cesium.JulianDate());
            }
            if (endTime) {
              endTime = new Cesium.JulianDate.fromDate(new Date(endTime), new Cesium.JulianDate());
            }
            let lines = [];
            if (position) {
              for (let i = 0; i < position.length; i += 3) {
                let p0 = position[i + 0];
                let p1 = position[i + 1];
                let p2 = position[i + 2];
                let p = new Cesium.Cartesian3(p0, p1, p2);
                lines.push(p);
              }
            }

            let obj = {
              viewer: that._viewer,
              startTime: startTime,
              endTime: endTime,
              position: lines,
              modelPath: modelPath
            }
            that.addEvent(obj);
          })
        }

        if (eventCollection) {
          eventCollection.forEach(item => {
            let startTime = item.startTime;
            let endTime = item.endTime;
            let eventType = item.eventType;
            let position = item.position;
            let positionOringon = item.positionOringon;
            let positionEnd = item.positionEnd;
            if (startTime) {
              startTime = new Cesium.JulianDate.fromDate(new Date(startTime), new Cesium.JulianDate());
            }
            if (endTime) {
              endTime = new Cesium.JulianDate.fromDate(new Date(endTime), new Cesium.JulianDate());
            }
            let lines = [];
            if (position && position.length > 3) {
              for (let i = 0; i < position.length; i += 3) {
                let p0 = position[i + 0];
                let p1 = position[i + 1];
                let p2 = position[i + 2];
                let p = new Cesium.Cartesian3(p0, p1, p2);
                lines.push(p);
              }
            } else {
              p = new Cesium.Cartesian3(position[0], position[1], position[2]);
            }

            if (positionOringon) {
              positionOringon = new Cesium.Cartesian3(positionOringon[0], positionOringon[1], positionOringon[2]);
            }
            if (positionEnd) {
              positionEnd = new Cesium.Cartesian3(positionEnd[0], positionEnd[1], positionEnd[2]);
            }

            let obj = {
              viewer: that._viewer,
              startTime: startTime,
              endTime: endTime,
              position: p ? p : lines,
              positionOringon: positionOringon,
              positionEnd: positionEnd,
              eventType: eventType
            }
            that.addEvent(obj);
          })
        }

        if (pathCollection) {
          pathCollection.forEach(item => {
            let position = item.position;
            let modelPath = item.modelPath;

            let lines = [];
            if (position) {
              for (let i = 0; i < position.length; i += 3) {
                let p0 = position[i + 0];
                let p1 = position[i + 1];
                let p2 = position[i + 2];
                let p = new Cesium.Cartesian3(p0, p1, p2);
                lines.push(p);
              }
            }
            let obj = {
              viewer: that._viewer,
              position: lines,
              modelPath: modelPath
            }
            that.addEvent(obj);
          })
        }
      }
    })

    // that.render();
  }
}


planControl.prototype.export = function () {
  let modelCollectionCopy = [];
  let eventCollectionCopy = [];
  let voiceCollectionCopy = [];
  let pathCollectionCopy = [];

  let modelCollection = this._planManage._modelCollection.concat();
  let eventCollection = this._planManage._eventCollection.concat();
  let voiceCollection = this._planManage._voiceCollection.concat();
  let pathCollection = this._planManage._pathCollection.concat();


  let t, e, p, po, poCopy, pe, peCopy;
  let obj = {};

  //   endOrition: Quaternion {x: 0.36930440310462576, y: -0.26249252665892314, z: 0.20508498081067877, w: 0.8675552327901862}
  // endTime: JulianDate {dayNumber: 2457106, secondsOfDay: 72095}
  // model: Entity {_availability: TimeIntervalCollection, _id: "b6eaec12-9f85-4ff1-a926-699878d91054", _definitionChanged: Event, _name: undefined, _show: true, …}
  // modelPath: "./static/data/model/CesiumAir/Cesium_Air.gltf"
  // orientation: VelocityOrientationProperty {_velocityVectorProperty: VelocityVectorProperty, _subscription: undefined, _ellipsoid: Ellipsoid, _definitionChanged: Event}
  // startTime:
  modelCollection.forEach(item => {
    if (item.startTime) {
      t = Cesium.JulianDate.toDate(item.startTime)
    }
    if (item.endTime) {
      e = Cesium.JulianDate.toDate(item.endTime)
    }

    //copyPositions
    let lines = [];
    if (item.position) {
      let position = item.position;
      if (position instanceof Array) {
        position.forEach(item => {
          let p = item;
          lines.push(p.x);
          lines.push(p.y);
          lines.push(p.z);
        })
      } else {
        lines.push(position.x);
        lines.push(position.y);
        lines.push(position.z);
      }
    }
    if (item.positionOringon) {
      po = item.positionOringon;
      poCopy = [po.x, po.y, po.z];
    }
    if (item.positionEnd) {
      pe = item.positionEnd;
      peCopy = [pe.x, pe.y, pe.z];
    }
    obj = {
      startTime: t,
      endTime: e,
      position: lines,
      modelPath: item.modelPath,
      positionOringon: poCopy || null,
      positionEnd: peCopy || null
    }
    modelCollectionCopy.push(obj);
  })

  eventCollection.forEach(item => {
    if (item.startTime) {
      t = Cesium.JulianDate.toDate(item.startTime);
    }
    if (item.endTime) {
      e = Cesium.JulianDate.toDate(item.endTime);
    }
    let lines = [];
    if (item.position) {
      let position = item.position;
      if (position instanceof Array) {
        position.forEach(item => {
          let p = item.position;
          lines.push(p.x);
          lines.push(p.y);
          lines.push(p.z);
        })
      } else {
        lines.push(position.x);
        lines.push(position.y);
        lines.push(position.z);
      }
    }
    if (item.positionOringon) {
      po = item.positionOringon;
      poCopy = [po.x, po.y, po.z];
    }
    if (item.positionEnd) {
      pe = item.positionEnd;
      peCopy = [pe.x, pe.y, pe.z];
    }

    let obj = {
      startTime: t,
      endTime: e,
      position: lines,
      positionOringon: poCopy || null,
      positionEnd: peCopy || null,
      eventType: item.eventType
    }
    eventCollectionCopy.push(obj);
  })

  pathCollection.forEach(item => {
    if (item.startTime) {
      t = Cesium.JulianDate.toDate(item.startTime)
    }
    if (item.endTime) {
      e = Cesium.JulianDate.toDate(item.endTime)
    }

    //copyPositions
    let lines = [];
    if (item.position) {
      let position = item.position;
      position.forEach(item => {
        let p = item;
        lines.push(p.x);
        lines.push(p.y);
        lines.push(p.z);
      })
    }

    let obj = {
      startTime: t,
      endTime: e,
      position: lines,
      modelPath: ''
    }
    pathCollectionCopy.push(obj);
  })

  voiceCollection.forEach(item => {
    if (item.startTime) {
      t = Cesium.JulianDate.toDate(item.startTime)
    }
    if (item.endTime) {
      e = Cesium.JulianDate.toDate(item.endTime)
    }
    let voiceText = item.voiceText;


    let obj = {
      startTime: t,
      endTime: e,
      voiceText: voiceText
    }
    voiceCollectionCopy.push(obj);
  })


  let exportText = {
    modelCollection: modelCollectionCopy,
    eventCollection: eventCollectionCopy,
    voiceCollection: voiceCollectionCopy,
    pathCollection: pathCollectionCopy
  }

  exportText = JSON.stringify(exportText);

  save(exportText);
  // 另存为html文件
  function save(text) {
    var savaName = 'planManahe'
    export_raw(savaName + '.json', text);
  }

  function export_raw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;

    var export_blob = new Blob([data]);

    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fake_click(save_link);
  }

  function fake_click(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(
      "click", true, false, window, 0, 0, 0, 0, 0
      , false, false, false, false, 0, null
    );
    obj.dispatchEvent(ev);
  }

}

export default planControl;