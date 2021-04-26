<template>
  <div id="app">
    <div class="menu">
      <!-- <button @click="startDraw()">绘制</button>
      <button @click="stopDraw()">结束绘制</button> -->
      <button @click="loadfire()">添加火灾</button>
      <button @click="loadfireWorks()">添加烟</button>
      <button @click="loadPath()">添加路线</button>
      <button @click="loadPath1()">添加路线1</button>
      <button @click="loadPath2()">添加路线2</button>
      <button @click="loadPath3()">添加路线3</button>
      <button @click="loadPath4()">添加路线4</button>
      <button @click="loadPath5()">添加路线5</button>
      <button @click="resetBaer()">修改烟的方位角度</button>
      <button @click="resetLevel()">修改烟的风力角度</button></br>
      <button @click="resetWaterOrigon()">修改水的起始位置</button>
      <button @click="resetWaterEnd()">修改水的终点位置</button></br>
      <button @click="resetFireStartTime()">修改火开始时间</button>
      <button @click="resetFireEndTime()">修改火结束时间</button>
      <button @click="resetModelStartTime()">修改模型开始时间</button>
      <button @click="resetModelEndTime()">修改模型结束时间</button>
      <button @click="play()">播放</button>
      <button @click="resetSpeed()">修改速度</button>
      <button @click="resetSpeed1()">修改速度1</button>
      <button @click="destory()">删除</button>
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
import dangerousArea from "@/js/dangerousArea.js";
import EntityMode from "@/js/EntityMode.js";
// import dangerousCarArea from "@/js/dangerousCarArea.js";


//   camera.flyTo({
//     destination: position,
//     orientation: {
//       heading: heading,
//       pitch: pitch,
//     },
//     easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
//   });
// }

// function offsetFromHeadingPitchRange(heading, pitch, range) {
//   pitch = Cesium.Math.clamp(
//     pitch,
//     -Cesium.Math.PI_OVER_TWO,
//     Cesium.Math.PI_OVER_TWO
//   );
//   heading = Cesium.Math.zeroToTwoPi(heading) - Cesium.Math.PI_OVER_TWO;

//   var pitchQuat = Cesium.Quaternion.fromAxisAngle(
//     Cesium.Cartesian3.UNIT_Y,
//     -pitch
//   );
//   var headingQuat = Cesium.Quaternion.fromAxisAngle(
//     Cesium.Cartesian3.UNIT_Z,
//     -heading
//   );
//   var rotQuat = Cesium.Quaternion.multiply(
//     headingQuat,
//     pitchQuat,
//     headingQuat
//   );
//   var rotMatrix = Cesium.Matrix3.fromQuaternion(rotQuat);

//   var offset = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_X);
//   Cesium.Matrix3.multiplyByVector(rotMatrix, offset, offset);
//   Cesium.Cartesian3.negate(offset, offset);
//   Cesium.Cartesian3.multiplyByScalar(offset, range, offset);
//   return offset;
// }

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
      viewer.scene.debugShowFramesPerSecond = true;
      viewer.scene.requestRenderMode = false;
      var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
      window.start1 = start;
      var stop = Cesium.JulianDate.addSeconds(
        start,
        70,
        new Cesium.JulianDate()
      );
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; //Loop at the end

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

      let position = [-112.11067361278276,36.1088154143215];
      let pos1 = Cesium.Cartesian3.fromDegrees(position[0],position[1],1);

      var heading = Cesium.Math.toRadians(345);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(
        pos1,
        hpr
      );

      var entity1 = viewer.entities.add({
        position: pos1,
        orientation: orientation,
        model: {
          uri: "./static/data/model/CesiumAir/Cesium_Air.gltf",
          minimumPixelSize: 128,
          // maximumScale: 0.3
          shadows: false
        }
      });

      // let position1 = [-112.11088361278276,36.1090154143215,0];
      // let pos2 = Cesium.Cartesian3.fromDegrees(position1[0],position1[1],0);

      // var heading = Cesium.Math.toRadians(0);
      // var pitch = 0;
      // var roll = 0;
      // var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      // var orientation = Cesium.Transforms.headingPitchRollQuaternion(
      //   pos2,
      //   hpr
      // );

      // var entity2 = viewer.entities.add({
      //   position: pos2,
      //   orientation: orientation,
      //   model: {
      //     uri: "./static/data/model/GroundVehicle.glb",
      //     minimumPixelSize: 128,
      //     maximumScale: 1,
      //     shadows: false
      //   }
      // });

      let p1 = {
        lon: position[0],
        lat:  position[1]
      };

      let options = {
        viewer: viewer,
        positionOrigin: p1,
        baseHeading : 345,
        // entityType:EntityMode.air
      };

      // let p2 = {
      //   lon: position1[0],
      //   lat:  position1[1]
      // };
      // let options1 = {
      //   viewer: viewer,
      //   positionOrigin: p2,
      //   baseHeading : 75,
      //   entityType:EntityMode.car
      // };

      // let areas = new dangerousArea(options);

      // areas.addArea();
      // areas.addBestArea();

      window.entity1 = entity1;

      viewer.zoomTo(entity1);
    },
    resetSpeed() {
      planModel.speed = 60;
    },
    resetSpeed1() {
      planModel.speed = 10;
    },
    resetBaer() {
      planEvent1.fireWorksBearAngle = 0.2;
    },
    resetLevel() {
      planEvent1.fireWorksLevelAngle = 0.2;
    },
    resetWaterOrigon() {
      planEvent_Water.positionOringon =
        window.pathOptions[window.pathOptions.length - 1];
    },
    resetWaterEnd() {
      planEvent_Water.positionEnd = this.position;
    },
    loadfire() {
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
       * position 添加事件的位置
       */
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
          startTime: window.start1,
          endTime: stop,
          position: position
        };
        // 新建事件类型
        let planEvent = new PlanEvent(options);
        window.planEvent = planEvent;
        //添加火
        planEvent.addEvent({ eventType: planMode.fire });
        // 添加到控制器中
        planControl.add(planEvent);

        /**
         * 修改时间
         *
         * */

        // planEvent.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planEvent.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );
      });
    },
    loadfireWorks() {
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
       * position 添加事件的位置
       */
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
          startTime: window.start1,
          endTime: stop,
          position: position
        };
        // 新建事件类型
        let planEvent1 = new PlanEvent(options);
        window.planEvent1 = planEvent1;
        //添加火
        planEvent1.addEvent({ eventType: planMode.fireworks });
        // 添加到控制器中 
        planControl.add(planEvent1);

        /**
         * 修改时间
         *
         * */

        // planEvent.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planEvent.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );
      });
    },
    resetFireStartTime() {
      planEvent.startTime = Cesium.JulianDate.addSeconds(
        window.start1,
        15,
        new Cesium.JulianDate()
      );
    },
    resetFireEndTime() {
      planEvent.endTime = Cesium.JulianDate.addSeconds(
        window.start1,
        20,
        new Cesium.JulianDate()
      );
    },
    resetModelStartTime() {
      planModel.startTime = Cesium.JulianDate.addSeconds(
        window.start1,
        20,
        new Cesium.JulianDate()
      );
    },
    resetModelEndTime() {
      planModel.endTime = Cesium.JulianDate.addSeconds(
        window.start1,
        25,
        new Cesium.JulianDate()
      );
    },
    play() {
      // window.viewer.clock.currentTime = window.start1;
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

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;

        window.pathOptions = position;
        /**
         * 添加路径 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * position   模型运路径坐标  数组类型
         */

        let pathOptions = {
          viewer: window.viewer,
          position: position
        };
        //新建路径类型
        let planPath = new PlanPath(pathOptions);
        //添加路径
        planPath.addPath();
        //添加到控制器
        planControl.add(planPath);

        /**
         * 添加模型 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * model      表示已经添加在场景中的模型 [和modelPath二选一]
         * modelPath  模型的url [和model二选一]
         * startTime  模型开始运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * endTime    模型结束运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * position   模型运路径坐标  数组类型
         */
        let options = {
          viewer: window.viewer,
          model: window.entity1,
          modelPath: modelPath,
          startTime: modelStartTime,
          speed: 30,
          position: position
        };

        //新建事件类型
        let planModel = new PlanModel(options);
        //添加模型
        planModel.addModel();
        //添加到控制器
        planControl.add(planModel);
        window.planModel = planModel;

        /**
         * 修改时间
         *
         * */

        // planModel.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planModel.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );

        /**
         * 添加喷水事件 表示喷水
         * viewer viewer全局对象
         * positionOringon 开始喷水的坐标位置 也就是模型运动的的坐标点位的最后一个位置
         * positionEnd  喷水到的坐标位置 也就是起火的位置
         * startTime  开始喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * endTime    结束喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
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
        //新建事件类型
        let planEvent_Water = new PlanEvent(options1);
        //根据类型添加事件
        planEvent_Water.addEvent({ eventType: planMode.water });
        //添加带控制器
        planControl.add(planEvent_Water);
        window.planEvent_Water = planEvent_Water;
      });
    },
    loadPath1() {
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

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;

        window.pathOptions = position;
        /**
         * 添加路径 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * position   模型运路径坐标  数组类型
         */

        let pathOptions = {
          viewer: window.viewer,
          position: position
        };
        //新建路径类型
        let planPath = new PlanPath(pathOptions);
        //添加路径
        planPath.addPath();
        //添加到控制器
        planControl.add(planPath);

        /**
         * 添加模型 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * model      表示已经添加在场景中的模型 [和modelPath二选一]
         * modelPath  模型的url [和model二选一]
         * startTime  模型开始运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * endTime    模型结束运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * position   模型运路径坐标  数组类型
         */
        let options = {
          viewer: window.viewer,
          modelPath: modelPath,
          startTime: modelStartTime,
          speed: 30,
          position: position
        };

        //新建事件类型
        let planModel = new PlanModel(options);
        //添加模型
        planModel.addModel();
        //添加到控制器
        planControl.add(planModel);
        window.planModel = planModel;

        /**
         * 修改时间
         *
         * */

        // planModel.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planModel.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );

        /**
         * 添加喷水事件 表示喷水
         * viewer viewer全局对象
         * positionOringon 开始喷水的坐标位置 也就是模型运动的的坐标点位的最后一个位置
         * positionEnd  喷水到的坐标位置 也就是起火的位置
         * startTime  开始喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * endTime    结束喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
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
        //新建事件类型
        let planEvent_Water = new PlanEvent(options1);
        //根据类型添加事件
        planEvent_Water.addEvent({ eventType: planMode.water });
        //添加带控制器
        planControl.add(planEvent_Water);
        window.planEvent_Water = planEvent_Water;
      });
    },
    loadPath2() {
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

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;

        window.pathOptions = position;
        /**
         * 添加路径 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * position   模型运路径坐标  数组类型
         */

        let pathOptions = {
          viewer: window.viewer,
          position: position
        };
        //新建路径类型
        let planPath = new PlanPath(pathOptions);
        //添加路径
        planPath.addPath();
        //添加到控制器
        planControl.add(planPath);

        /**
         * 添加模型 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * model      表示已经添加在场景中的模型 [和modelPath二选一]
         * modelPath  模型的url [和model二选一]
         * startTime  模型开始运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * endTime    模型结束运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * position   模型运路径坐标  数组类型
         */
        let options = {
          viewer: window.viewer,
          modelPath: modelPath,
          startTime: modelStartTime,
          speed: 30,
          position: position
        };

        //新建事件类型
        let planModel = new PlanModel(options);
        //添加模型
        planModel.addModel();
        //添加到控制器
        planControl.add(planModel);
        window.planModel = planModel;

        /**
         * 修改时间
         *
         * */

        // planModel.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planModel.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );

        /**
         * 添加喷水事件 表示喷水
         * viewer viewer全局对象
         * positionOringon 开始喷水的坐标位置 也就是模型运动的的坐标点位的最后一个位置
         * positionEnd  喷水到的坐标位置 也就是起火的位置
         * startTime  开始喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * endTime    结束喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
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
        //新建事件类型
        let planEvent_Water = new PlanEvent(options1);
        //根据类型添加事件
        planEvent_Water.addEvent({ eventType: planMode.water });
        //添加带控制器
        planControl.add(planEvent_Water);
        window.planEvent_Water = planEvent_Water;
      });
    },
    loadPath3() {
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

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;

        window.pathOptions = position;
        /**
         * 添加路径 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * position   模型运路径坐标  数组类型
         */

        let pathOptions = {
          viewer: window.viewer,
          position: position
        };
        //新建路径类型
        let planPath = new PlanPath(pathOptions);
        //添加路径
        planPath.addPath();
        //添加到控制器
        planControl.add(planPath);

        /**
         * 添加模型 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * model      表示已经添加在场景中的模型 [和modelPath二选一]
         * modelPath  模型的url [和model二选一]
         * startTime  模型开始运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * endTime    模型结束运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * position   模型运路径坐标  数组类型
         */
        let options = {
          viewer: window.viewer,
          modelPath: modelPath,
          startTime: modelStartTime,
          speed: 30,
          position: position
        };

        //新建事件类型
        let planModel = new PlanModel(options);
        //添加模型
        planModel.addModel();
        //添加到控制器
        planControl.add(planModel);
        window.planModel = planModel;

        /**
         * 修改时间
         *
         * */

        // planModel.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planModel.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );

        /**
         * 添加喷水事件 表示喷水
         * viewer viewer全局对象
         * positionOringon 开始喷水的坐标位置 也就是模型运动的的坐标点位的最后一个位置
         * positionEnd  喷水到的坐标位置 也就是起火的位置
         * startTime  开始喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * endTime    结束喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
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
        //新建事件类型
        let planEvent_Water = new PlanEvent(options1);
        //根据类型添加事件
        planEvent_Water.addEvent({ eventType: planMode.water });
        //添加带控制器
        planControl.add(planEvent_Water);
        window.planEvent_Water = planEvent_Water;
      });
    },
    loadPath4() {
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

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;

        window.pathOptions = position;
        /**
         * 添加路径 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * position   模型运路径坐标  数组类型
         */

        let pathOptions = {
          viewer: window.viewer,
          position: position
        };
        //新建路径类型
        let planPath = new PlanPath(pathOptions);
        //添加路径
        planPath.addPath();
        //添加到控制器
        planControl.add(planPath);

        /**
         * 添加模型 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * model      表示已经添加在场景中的模型 [和modelPath二选一]
         * modelPath  模型的url [和model二选一]
         * startTime  模型开始运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * endTime    模型结束运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * position   模型运路径坐标  数组类型
         */
        let options = {
          viewer: window.viewer,
          modelPath: modelPath,
          startTime: modelStartTime,
          speed: 30,
          position: position
        };

        //新建事件类型
        let planModel = new PlanModel(options);
        //添加模型
        planModel.addModel();
        //添加到控制器
        planControl.add(planModel);
        window.planModel = planModel;

        /**
         * 修改时间
         *
         * */

        // planModel.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planModel.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );

        /**
         * 添加喷水事件 表示喷水
         * viewer viewer全局对象
         * positionOringon 开始喷水的坐标位置 也就是模型运动的的坐标点位的最后一个位置
         * positionEnd  喷水到的坐标位置 也就是起火的位置
         * startTime  开始喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * endTime    结束喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
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
        //新建事件类型
        let planEvent_Water = new PlanEvent(options1);
        //根据类型添加事件
        planEvent_Water.addEvent({ eventType: planMode.water });
        //添加带控制器
        planControl.add(planEvent_Water);
        window.planEvent_Water = planEvent_Water;
      });
    },
    loadPath5() {
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

      var modelPath = "./static/data/model/CesiumAir/Cesium_Air.gltf";
      var that = this;
      planDraw.startDraw("polyline", function(val) {
        var position = val.position;

        window.pathOptions = position;
        /**
         * 添加路径 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * position   模型运路径坐标  数组类型
         */

        let pathOptions = {
          viewer: window.viewer,
          position: position
        };
        //新建路径类型
        let planPath = new PlanPath(pathOptions);
        //添加路径
        planPath.addPath();
        //添加到控制器
        planControl.add(planPath);

        /**
         * 添加模型 表示模型在这表路径上运动
         * viewer: 全局viewer对象
         * model      表示已经添加在场景中的模型 [和modelPath二选一]
         * modelPath  模型的url [和model二选一]
         * startTime  模型开始运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * endTime    模型结束运动的时间  应该比整个预案的开始时间大，比预案的结束时间早
         * position   模型运路径坐标  数组类型
         */
        let options = {
          viewer: window.viewer,
          modelPath: modelPath,
          startTime: modelStartTime,
          speed: 30,
          position: position
        };

        //新建事件类型
        let planModel = new PlanModel(options);
        //添加模型
        planModel.addModel();
        //添加到控制器
        planControl.add(planModel);
        window.planModel = planModel;

        /**
         * 修改时间
         *
         * */

        // planModel.startTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   20,
        //   new Cesium.JulianDate()
        // );
        // planModel.endTime = Cesium.JulianDate.addSeconds(
        //   window.start1,
        //   35,
        //   new Cesium.JulianDate()
        // );

        /**
         * 添加喷水事件 表示喷水
         * viewer viewer全局对象
         * positionOringon 开始喷水的坐标位置 也就是模型运动的的坐标点位的最后一个位置
         * positionEnd  喷水到的坐标位置 也就是起火的位置
         * startTime  开始喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
         * endTime    结束喷水的时间  应该模型运动的结束时间晚，比预案的结束时间早
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
        //新建事件类型
        let planEvent_Water = new PlanEvent(options1);
        //根据类型添加事件
        planEvent_Water.addEvent({ eventType: planMode.water });
        //添加带控制器
        planControl.add(planEvent_Water);
        window.planEvent_Water = planEvent_Water;
      });
    },
   
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
