<template>
  <div id="app">
    <div class="menu">
      <!-- <button @click="startDraw()">绘制</button>
      <button @click="stopDraw()">结束绘制</button> -->
      <button @click="loadEvent()">添加灾害</button>
      <button @click="loadPath()">添加路线</button>
      <!-- <button @click="loadPath1()">添加路线1</button> -->
      <button @click="play()">播放</button>
      <button @click="rePlay()">重新播放</button>
      <button @click="destory()">结束</button>
      <button @click="import1()">导入</button>
      <button @click="exports1()">导出</button>
    </div>
  </div>
</template>

<script>
import PlanPath from "@/js/planPath.js";
import PlanModel from "@/js/planModel.js";
import planMode from "@/js/planMode.js";
import PlanEvent from "@/js/planEvent.js";
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
      window.start1 = start;
      var stop = Cesium.JulianDate.addSeconds(
        start,
        70,
        new Cesium.JulianDate()
      );
      //Make sure viewer is at the desired time.
      viewer.clock.startTime = start.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; //Loop at the end
      // viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED; //Loop at the end

      viewer.scene.globe.depthTestAgainstTerrain = true;

      var planDraw = new planDraws({
        viewer: viewer
      });
      window.planDraw = planDraw;

      //初始化
      var planControl = new planControls({
        viewer: window.viewer,
        startTime: start,
        endTime: stop
      });
      window.planControl = planControl;

      var entity1 = viewer.entities.add({
        position: new Cesium.Cartesian3(
          -1941790.9268206651,
          -4779499.932850377,
          3737953.120678378
        ),
        model: {
          uri: "./static/data/model/CesiumAir/Cesium_Air.gltf",
          minimumPixelSize: 0.1,
          maximumScale: 0.3
        }
      });

      window.entity1 = entity1;

      viewer.zoomTo(entity1);

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
      var stop = Cesium.JulianDate.addSeconds(
        window.start1,
        60,
        new Cesium.JulianDate()
      );

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      //添加火

      /**
       * startTime火的开始时间  应该比整个预案的开始时间大，比预案的结束时间早
       * endTime 火的结束时间  应该比整个预案的开始时间大，比预案的结束时间早
       * eventType火的类型，表示发生的事件是火
       */
      planDraw.startDraw("point", function(val) {
        viewer.clock.currentTime = window.start1.clone();
        var position = val.position;
        var posCopy = Cesium.Cartographic.fromCartesian(position);
        if (posCopy.height < 0.5) {
          posCopy.height += 1;
        }
        position = Cesium.Cartographic.toCartesian(posCopy);
        that.position = position;
        let options = {
          viewer: window.viewer,
          startTime: window.start1,
          endTime: stop,
          position: position
        };
        let planEvent = new PlanEvent(options);
        planEvent.addEvent({ eventType: planMode.fire });
        planControl.add(planEvent);
      });
    },
    play() {
      window.viewer.clock.currentTime = window.start1;
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
      // var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
      var modelStartTime = Cesium.JulianDate.addSeconds(
        window.start1,
        5,
        new Cesium.JulianDate()
      );
      var modelEndTime = Cesium.JulianDate.addSeconds(
        window.start1,
        30,
        new Cesium.JulianDate()
      );
      var modelEndTime1 = Cesium.JulianDate.addSeconds(
        window.start1,
        65,
        new Cesium.JulianDate()
      );

      viewer.clock.currentTime = window.start1.clone();

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;
        /**
         * 添加路径和模型 表示模型在这表路径上运动
         * model      表示已经添加在场景中的模型 [和modelPath二选一]
         * modelPath  模型的url [和model二选一]
         * startTime  模型开始运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * endTime    模型结束运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * position   模型运路径坐标  数组类型
         */
        let pathOptions = {
          viewer: window.viewer,
          position: position
        };

        let planPath = new PlanPath(pathOptions);
        planPath.addPath();
        planControl.add(planPath);

        let options = {
          viewer: window.viewer,
          model: window.entity1,
          modelPath: modelPath,
          startTime: modelStartTime,
          endTime: modelEndTime,
          position: position
        };

        let planModel = new PlanModel(options);
        planModel.addModel();
        planControl.add(planModel);
        window.planModel = planModel;

        /**
         * 添加喷水事件 表示喷水
         *
         * positionOringon 开始喷水的坐标位置 也就是模型运动的的坐标点位的最后一个位置
         * positionEnd  喷水到的坐标位置 也就是起火的位置
         * startTime  开始喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * endTime    结束喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * eventType  喷水事件类型
         *
         * 开始时间和结束时间间隔尽量大一些，最少30秒
         */
        let options1 = {
          viewer: window.viewer,
          positionOringon: position[position.length - 1],
          positionEnd: that.position,
          startTime: modelEndTime,
          endTime: modelEndTime1
        };

        let planEvent_Water = new PlanEvent(options1);
        planEvent_Water.addEvent({ eventType: planMode.water });
        planControl.add(planEvent_Water);
      });
    },
    loadPath1() {
      var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
      var modelStartTime = Cesium.JulianDate.addSeconds(
        window.start1,
        25,
        new Cesium.JulianDate()
      );
      var modelEndTime = Cesium.JulianDate.addSeconds(
        window.start1,
        35,
        new Cesium.JulianDate()
      );
      var modelEndTime1 = Cesium.JulianDate.addSeconds(
        window.start1,
        68,
        new Cesium.JulianDate()
      );

      viewer.clock.currentTime = window.start1.clone();

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;

        let options = {
          viewer: window.viewer,
          model: window.entity1,
          modelPath: modelPath,
          startTime: modelStartTime,
          endTime: modelEndTime,
          position: position
        };

        planControl.addEvent(options);

        let options1 = {
          viewer: window.viewer,
          positionOringon: position[position.length - 1],
          positionEnd: that.position,
          startTime: modelEndTime,
          endTime: modelEndTime1,
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
