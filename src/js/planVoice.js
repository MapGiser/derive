function PlanVocie(options) {
  this._startTime = Cesium.defaultValue(options.startTime, null);
  this._endTime = Cesium.defaultValue(options.endTime, null);
  this._voiceText = Cesium.defaultValue(options.voiceText, null);
  this.initVoice(this._voiceText);
}

PlanVocie.prototype.initVoice = function (text) {
  if (text) {
    this._voiceText = new SpeechSynthesisUtterance(text);
  }
}

PlanVocie.prototype.speak = function () {
  if (this._voiceText) {
    window.speechSynthesis.speak(this._voiceText);
  }
}

Object.defineProperties(PlanVocie, {
  voiceText: {
    get: function () {
      return this._voiceText;
    },
    set: function (value) {
      if (value) {
        this._voiceText = value;
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
  }
})

export default PlanVocie;