import planManage from './planManage.js'
import planMode from './planMode.js'
import PlanEvent from './planEvent.js'
import PlanModel from './planModel.js';
import PlanPath from './planPath';
function planControl(options) {
  if (!options.viewer) {
    console.error('viewer is required!');
  }
  this._viewer = options.viewer;
  this._viewer.clock.startTime = Cesium.Iso8601.MINIMUM_VALUE;
  this._viewer.clock.currentTime = Cesium.Iso8601.MINIMUM_VALUE;
  this._startTime = options.startTime;
  this._endTime = options.endTime;
  if (this._startTime && this._endTime) {
    let timeSeconds = Cesium.JulianDate.secondsDifference(this._endTime, this._startTime);
    let middleTime = Cesium.JulianDate.addSeconds(this._startTime, timeSeconds / 2, new Cesium.JulianDate());
    this._middleTime = Cesium.defaultValue(options.middleTime, middleTime);
  }
  // this._planManage = new planManage();

  this._modelCollection = [];
  this._eventCollection = [];
  this._pathCollection = [];
  this._voiceCollection = [];
  this._labelCollection = [];
}

planControl.prototype.add = function (event) {
  if (Cesium.defined(event)) {
    if (Cesium.defined(event._eventType) && event._startTime && event._endTime) {
      if (event._eventType === planMode.fire || event._eventType === planMode.fireworks || event._eventType === planMode.water) {
        this._eventCollection.push(event);
        if(event._label){
          this._labelCollection.push(event._label);
        }
      }
    }
    if (event._eventType === 'path') {
      this._pathCollection.push(event);
    }
    if (event._modelGraphic && event._startTime && event._endTime) {
      this._modelCollection.push(event);
    }
  }
}

planControl.prototype.addEvent = function (options) {
  this._planManage.add(options);
}

planControl.prototype.rePlay = function () {
  this.play();
}

planControl.prototype.play = function (model) {
  let viewer = this._viewer;
  if (model) {
    this.playSingle(model);
  }
  viewer.clock.currentTime = this._startTime.clone();
}

planControl.prototype.playSingle = function (model) {
  if (model && this._modelCollection.length > 0) {
    for (let i = 0; i < this._modelCollection.length; i++) {
      let modelCi = this._modelCollection[i];
      if (modelCi._model._id === model._id) {
        modelCi._singleMove = true;
      } else {
        modelCi._singleMove = false;
      }
    }
  }
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
  this.remove();
  return this.isDestory = true;
}

planControl.prototype.remove = function () {
  let viewer = this._viewer;
  let modelCollection = this._modelCollection;
  let eventCollection = this._eventCollection;
  let voiceCollection = this._voiceCollection;
  let pathCollection = this._pathCollection;
  let labelCollection = this._labelCollection;

  modelCollection.forEach(item => {
    let model = item._entityModel;
    if (model) viewer.entities.remove(model);
  })

  labelCollection.forEach(item => {
    let model = item;
    if (model) viewer.entities.remove(model);
    model = null;
  })

  eventCollection.forEach(item => {
    let event = item._event;
    if (event) viewer.scene.primitives.remove(event);
    event = null;
  })
  pathCollection.forEach(item => {
    let path = item._entityModel;
    if (path) viewer.entities.remove(path);
    path = null;
  })
  voiceCollection.forEach(item => {
    item.voiceText = null;
  })


  this._modelCollection.length = this._eventCollection.length = this._voiceCollection.length = this._pathCollection.length = 0;
}

planControl.prototype.fromJSON = function (jsonFile) {
  let that = this;
  if (jsonFile) {
    this._modelCollection.length = this._eventCollection.length = this._voiceCollection.length = this._pathCollection.length = 0;
    Cesium.Resource.fetchJson(jsonFile).then(function (val) {
      if (val) {
        let modelCollection = val.modelCollection.concat();
        let eventCollection = val.eventCollection.concat();
        let pathCollection = val.pathCollection.concat();
        let voiceCollection = val.voiceCollection.concat();
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

            let planModel = new PlanModel(obj);
            planModel.addModel();
            that.add(planModel);
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
            let fireWorksBearAngle = item.fireWorksBearAngle;
            let fireWorksLevelAngle = item.fireWorksLevelAngle;
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
              eventType: eventType,
              fireWorksBearAngle: fireWorksBearAngle || null,
              fireWorksLevelAngle: fireWorksLevelAngle || null
            }
            let planEvent = new PlanEvent(obj);
            planEvent.addEvent({ eventType: eventType });
            that.add(planEvent);
          })
        }

        if (pathCollection) {
          pathCollection.forEach(item => {
            let position = item.position;

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
              eventType: item.eventType
            }

            let planPath = new PlanPath(obj);
            planPath.addPath();
            that.add(planPath);
          })
        }
      }
    })
  }
}

planControl.prototype.export = function () {
  let modelCollectionCopy = [];
  let eventCollectionCopy = [];
  let voiceCollectionCopy = [];
  let pathCollectionCopy = [];

  let modelCollection = this._modelCollection;
  let eventCollection = this._eventCollection;
  let voiceCollection = this._voiceCollection;
  let pathCollection = this._pathCollection;


  let t, e, p, po, poCopy, pe, peCopy, fireWorksBearAngle, fireWorksLevelAngle;
  let obj = {};
  modelCollection.forEach(item => {
    if (item._startTime) {
      t = Cesium.JulianDate.toDate(item._startTime)
    }
    if (item._endTime) {
      e = Cesium.JulianDate.toDate(item._endTime)
    }

    //copyPositions
    let lines = [];
    if (item._positions) {
      let position = item._positions;
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

    if (item._positionOringon) {
      po = item._positionOringon;
      poCopy = [po.x, po.y, po.z];
    }
    if (item._positionEnd) {
      pe = item._positionEnd;
      peCopy = [pe.x, pe.y, pe.z];
    }
    obj = {
      startTime: t,
      endTime: e,
      position: lines,
      modelPath: item._modelPath,
      positionOringon: poCopy || null,
      positionEnd: peCopy || null,
      eventType: item._eventType
    }
    modelCollectionCopy.push(obj);
  })

  eventCollection.forEach(item => {
    if (item._startTime) {
      t = Cesium.JulianDate.toDate(item._startTime);
    }
    if (item._endTime) {
      e = Cesium.JulianDate.toDate(item._endTime);
    }
    let lines = [];
    if (item._position) {
      let position = item._position;
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
    if (item._positionOringon) {
      po = item._positionOringon;
      poCopy = [po.x, po.y, po.z];
    }
    if (item._positionEnd) {
      pe = item._positionEnd;
      peCopy = [pe.x, pe.y, pe.z];
    }

    let obj = {
      startTime: t,
      endTime: e,
      position: lines,
      positionOringon: poCopy || null,
      positionEnd: peCopy || null,
      fireWorksBearAngle: item._eventType === 1 ? item.fireWorksBearAngle : null,
      fireWorksLevelAngle: item._eventType === 1 ? item.fireWorksLevelAngle : null,
      eventType: item._eventType
    }
    eventCollectionCopy.push(obj);
  })

  pathCollection.forEach(item => {
    if (item._startTime) {
      t = Cesium.JulianDate.toDate(item._startTime)
    }
    if (item._endTime) {
      e = Cesium.JulianDate.toDate(item._endTime)
    }

    //copyPositions
    let lines = [];
    if (item._positions) {
      let position = item._positions;
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
      eventType: item._eventType
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