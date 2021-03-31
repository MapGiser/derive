function planDraw(options) {
  if (!options.viewer) {
    console.error('options.viewer is required!');
  }
  this._viewer = options.viewer;
  this._handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  this._drawEntity = undefined;
  this._polylineWidth = Cesium.defaultValue(options.polylineWidth, 4);
  this._polylineColor = Cesium.defaultValue(options.polylineColor, Cesium.Color.CYAN);
  this._positions = Cesium.defaultValue(options.positions, undefined);
}

planDraw.prototype.drawLine = function (callback) {
  let handle = this._handler;
  let viewer = this._viewer;
  let positions = [];
  let copyPositions = [];
  let flag;
  let that = this;
  handle.setInputAction(function (movement) {
    var pickedObject = viewer.scene.pickPosition(movement.position);
    if (pickedObject) {
      if (positions.length === 0) {
        flag = positions;
        that._drawEntity = viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(function () {
              return copyPositions.concat();
            }, false),
            width: that._polylineWidth,
            material: new Cesium.PolylineDashMaterialProperty({
              color: that._polylineColor
            }),
            clampToGround: true,
            classificationType: Cesium.ClassificationType.BOTH
          }
        })
      }
      positions.push(pickedObject);
      copyPositions = positions.concat();
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handle.setInputAction(function (movement) {
    if (flag) {
      var pickedPosition = viewer.scene.pickPosition(movement.endPosition);
      if (pickedPosition) {
        if (positions.length === 1) {
          positions.push(pickedPosition);
        } else if (positions.length > 1) {
          positions.pop();
          positions.push(pickedPosition);
          copyPositions = positions.concat();
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handle.setInputAction(function () {
    copyPositions.pop();
    that._positions = copyPositions;
    handle.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handle.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handle.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    positions.length = 0;
    that._drawEntity.show = false;
    callback({
      position: copyPositions,
      model: that._drawEntity
    });
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

planDraw.prototype.drawPoint = function (callback) {
  let handle = this._handler;
  let viewer = this._viewer;
  let that = this;
  handle.setInputAction(function (movement) {
    var pickedObject = viewer.scene.pickPosition(movement.position);
    if (pickedObject) {
      that._drawEntity = viewer.entities.add({
        position: pickedObject
      })
      that._positions = pickedObject;
      handle.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      that._drawEntity.show = false;
      callback({
        position: that._positions,
        model: that._drawEntity
      });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

planDraw.prototype.startDraw = function (type, callback) {
  if (type) {
    switch (type) {
      case 'point':
        this.drawPoint(function (val) {
          callback(val);
        });
        break;
      case 'polyline':
        this.drawLine(function (val) {
          callback(val);
        });
        break;
      case 'polygon':
        break;
    }

  }

}

planDraw.prototype.stopDraw = function () {
  if (this._drawEntity) {
    return this._drawEntity;
  }
}

export default planDraw;