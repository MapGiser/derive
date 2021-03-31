<template>
  <div id="app">
    <div class="menu">
      <!-- <button @click="startDraw()">绘制</button>
      <button @click="stopDraw()">结束绘制</button> -->
      <button @click="loadEvent()">添加灾害</button>
      <button @click="loadPath()">添加路线</button>
      <button @click="play()">播放</button>
      <button @click="rePlay()">重新播放</button>
      <button @click="destory()">结束</button>
      <button @click="import1()">导入</button>
      <button @click="exports1()">导出</button>
    </div>
  </div>
</template>

<script>
import planModel from "@/js/planModel.js";
import planMode from "@/js/planMode.js";
import CesiumEvent from "@/js/planEvent.js";
import planDraws from "@/js/planDraw.js";
import planManage from "@/js/planManage.js";
import planControls from "@/js/planControl.js";

export default {
  name: "App",
  data() {
    return {
      position: null
    };
  },
  methods: {
    initManage() {
      var viewer = window.viewer;
      var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
      var stop = Cesium.JulianDate.addSeconds(
        start,
        60,
        new Cesium.JulianDate()
      );
      //Make sure viewer is at the desired time.
      viewer.clock.startTime = start.clone();
      // viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; //Loop at the end
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end

      viewer.scene.globe.depthTestAgainstTerrain = true;

      var planDraw = new planDraws({
        viewer: viewer
      });
      window.planDraw = planDraw;

      // var planManages = new planManage({});
      // window.planManages = planManages;
      var planControl = new planControls({
        viewer: window.viewer,
        startTime: start,
        endTime: stop
      });
      window.planControl = planControl;

      // var entity1 = viewer.entities.add({
      //   position: new Cesium.Cartesian3(
      //     -1941790.9268206651,
      //     -4779499.932850377,
      //     3737953.120678378
      //   ),
      //   model: {
      //     uri: "./static/data/model/CesiumAir/Cesium_Air.gltf",
      //     minimumPixelSize: 0.1,
      //     maximumScale: 0.3
      //   }
      // });

      // window.entity1 = entity1;

      // viewer.zoomTo(entity1);

      // viewer.camera.setView({
      //   destination: Cesium.Cartesian3.fromDegrees(
      //     -112.110693,
      //     36.0994841,
      //     1000
      //   ),
      //   orientation: {
      //     heading: Cesium.Math.toRadians(358.3427926550179),
      //     pitch: Cesium.Math.toRadians(-52.50529304678685),
      //     roll: Cesium.Math.toRadians(359.99096998079574)
      //   }
      // });
    },
    loadEvent() {
      var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
      var stop = Cesium.JulianDate.addSeconds(
        start,
        60,
        new Cesium.JulianDate()
      );

      var time = {
        start: start,
        end: stop
      };

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("point", function(val) {
        var position = val.position;
        var posCopy = Cesium.Cartographic.fromCartesian(position);
        if (posCopy.height < 0.5) {
          posCopy.height += 1;
        }
        position = Cesium.Cartographic.toCartesian(posCopy);
        that.position = position;
        let options = {
          viewer: window.viewer,
          startTime: start,
          endTime: stop,
          position: position,
          eventType: planMode.fire
        };
        planControl.addEvent(options);
      });
    },
    play() {
      planControl.play();
    },
    rePlay() {
      planControl.rePlay();
    },
    import1() {
      planControl.fromJSON("./static/data/planManahe.json");
    },
    exports1() {
      planControl.export();
    },
    exports1() {
      planControl.export();
    },
    destory() {
      planControl.destory();
    },
    loadPath() {
      var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
      var stop = Cesium.JulianDate.addSeconds(
        start,
        60,
        new Cesium.JulianDate()
      );

      viewer.clock.currentTime = start.clone();

      var time = {
        start: start,
        end: stop
      };

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;
        // var model = val.entity;
        // var posCopy = Cesium.Cartographic.fromCartesian(position);
        // if (posCopy.height < 0.5) {
        //   posCopy.height += 1;
        // }
        // position = Cesium.Cartographic.toCartesian(posCopy);
        var timeSeconds = Cesium.JulianDate.secondsDifference(stop, start);
        var middleTime = Cesium.JulianDate.addSeconds(
          start,
          timeSeconds / 2,
          new Cesium.JulianDate()
        );

        let options = {
          viewer: window.viewer,
          // model: window.entity1,
          modelPath: modelPath,
          startTime: start,
          middleTime: middleTime,
          endTime: stop,
          position: position
        };

        planControl.addEvent(options);

        let options1 = {
          viewer: window.viewer,
          positionOringon: position[position.length - 1],
          positionEnd: that.position,
          startTime: start,
          endTime: stop,
          position: position,
          eventType: planMode.water
        };
        planControl.addEvent(options1);
      });
    }
  },
  mounted() {
    this.initManage();
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
html,
body {
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  position: absolute;
}

.menu {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
}
</style>
