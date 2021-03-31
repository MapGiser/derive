import planEvent from './planEvent.js'
import planPath from './planPath.js'
import planModel from './planModel.js'
import planVoice from './planVoice.js'
function planManage() {
  this._modelCollection = [];
  this._eventCollection = [];
  this._voiceCollection = [];
  this._pathCollection = [];
}

planManage.prototype.add = function (options) {
  if (options) {
    if (options.eventType != null && typeof (options.eventType) != "undefined") {
      this.addEvent(options);
    }
    if (options.modelPath) {
      if (options.model) {
        this.addModelEntity(options);
      } else {
        this.addModel(options);
      }
      this.addPath(options);

    }
    if (options.voiceText) {
      this.addVoice(options);
    }
  }
}

planManage.prototype.addEvent = function (options) {
  if (options && options.eventType != null && typeof (options.eventType) != "undefined") {
    this._planEvent = new planEvent(options);
    this._event = this._planEvent.addEvent(options);
    this._eventCollection.push({
      event: this._event,
      eventType: this._planEvent._eventType,
      startTime: this._planEvent._startTime,
      endTime: this._planEvent._endTime,
      emissionRate: this._planEvent._emissionRate,
      position: this._planEvent._position,
      positionOringon: this._planEvent._positionOringon,
      positionEnd: this._planEvent._positionEnd
    })
    return this._event;
  }
}

planManage.prototype.addModel = function (options) {
  if (options && options.modelPath) {
    this._planModel = new planModel(options);
    this._model = this._planModel.addModel();
    this._modelCollection.push({
      model: this._model,
      modelPath: this._planModel._modelPath,
      startTime: this._planModel._startTime,
      endTime: this._planModel._endTime,
      orientation: this._planModel._orientation,
      endOrition: this._planModel._endOrition,
      position: this._planModel._positions
    })
  }
}
planManage.prototype.addModelEntity = function (options) {
  if (options && options.model) {
    this._planModel = new planModel(options);
    this._model = this._planModel.addModel();
    this._modelCollection.push({
      model: this._model,
      modelPath: this._planModel._modelPath,
      startTime: this._planModel._startTime,
      endTime: this._planModel._endTime,
      orientation: this._planModel._orientation,
      endOrition: this._planModel._endOrition,
      position: this._planModel._positions
    })
  }
}

planManage.prototype.addPath = function (options) {
  if (options && options.position) {
    this._planPath = new planPath(options);
    this._path = this._planPath.addPath();
    this._pathCollection.push({
      path: this._path,
      position: this._planPath._positions
    })
  }
}

planManage.prototype.addVoice = function (options) {
  if (options && options.voiceText) {
    this._planVoice = new planVoice(options);
    this._voiceCollection.push({
      voiceText: this._planVoice._voiceText,
      startTime: this._planVoice._startTime,
      endTime: this._planVoice._endTime,
      speak: this._planVoice.speak
    })
  }
}

planManage.prototype.exportJson = function () {
  let exportText = {};
  exportText.model = this._modelCollection;
  exportText.events = this._eventCollection;
  exportText.voices = this._voiceCollection;
  let jsonText = JSON.stringify(exportText);
  return jsonText;


}

export default planManage;