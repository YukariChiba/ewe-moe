<template>
  <div :class="invert ? 'bg inv' : 'bg'">
    <Renderer
      ref="renderer"
      pointer
      resize="window"
      @mousemove="mouseMove"
      @mousewheel="randomColors"
      @touchmove="touchMove"
    >
      <Camera :position="{ z: 200 }" :fov="50" />
      <Scene>
        <AmbientLight color="#808080" :intensity="0.5" />
        <PointLight
          ref="light"
          :color="envColor"
          :intensity="0.3"
          :position="{ z: 200 }"
        />
        <Text
          ref="title"
          @pointerOver="titleOver"
          :text="info.title"
          font-src="/assets/font.json"
          align="center"
          :size="textsize"
          @click="togglepopup(true)"
          :height="0"
          :position="{ x: 0, y: 10, z: 100 }"
        >
          <PhongMaterial color="#666666" />
        </Text>
        <Text
          v-if="hint"
          ref="hint"
          :text="hint"
          align="center"
          font-src="/assets/font.json"
          :size="0.01"
          :height="0"
          :position="{ x: 0, y: 20, z: 100 }"
        >
          <PhongMaterial color="#fff" />
        </Text>
        <Points ref="points" :position="{ z: 50 }">
          <BufferGeometry :attributes="attributes" />
          <ShaderMaterial
            :props="{
              blending: 2,
              depthTest: false,
              uniforms: uniforms,
              vertexShader: vertexShader,
              fragmentShader: fragmentShader,
            }"
          >
            <Texture src="/assets/sprite.png" uniform="uTexture" />
          </ShaderMaterial>
        </Points>

        <InstancedMesh ref="imesh" :count="NUM_INSTANCES">
          <BoxGeometry :width="2" :height="2" :depth="10" />
          <StandardMaterial
            :props="{
              transparent: true,
              opacity: cnt > 5 ? 0.9 : 0,
              metalness: 0.8,
              roughness: 0.5,
            }"
          />
        </InstancedMesh>
      </Scene>
      <EffectComposer>
        <RenderPass />
        <UnrealBloomPass :strength="3" :radius="0.8" :threshold="0" />
        <ZoomBlurPass :strength="zoomStrength" />
        <FilmPass
          :noiseIntensity="5"
          :scanlinesIntensity="0.3"
          :scanlinesCount="512"
          :grayscale="0"
          v-if="showpopup"
        />
      </EffectComposer>
    </Renderer>
    <Popup
      :show="showpopup"
      @pclose="togglepopup(false)"
      @pattern="updateColors"
      :cnt="cnt"
    />
  </div>
</template>

<script>
import { vertexShader, fragmentShader } from "../data/shaders";

import { Object3D, Clock, Color, MathUtils, Vector3 } from "three";

import { lerp } from "troisjs";

const { randFloat: rnd, randInt, randFloatSpread: rndFS } = MathUtils;

import niceColors from "../data/colors";
import info from "../data/info.json";
import Popup from "./Popup.vue";

export default {
  components: { Popup },
  data: () => ({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: { uTime: { value: 0 } },
    zoomStrength: 0.5,
    timeCoef: 1,
    textsize: 30,
    info: info,
    targetTimeCoef: 1,
    envColor: "#0060ff",
    stbyColor: "#ff0000",
    showpopup: false,
    invert: 0,
    cnt: 0,
    hint: null,
  }),
  setup() {
    let POINTS_COUNT = 40000;

    if (window.innerWidth > 1920 || window.innerHeight > 1080)
      POINTS_COUNT = 100000;

    const palette = niceColors[83];

    const positions = new Float32Array(POINTS_COUNT * 3);
    const colors = new Float32Array(POINTS_COUNT * 3);
    const sizes = new Float32Array(POINTS_COUNT);
    const v3 = new Vector3(),
      color = new Color();
    for (let i = 0; i < POINTS_COUNT; i++) {
      v3.set(rndFS(200), rndFS(200), rndFS(300));
      v3.toArray(positions, i * 3);
      color.set(palette[Math.floor(rnd(0, palette.length))]);
      color.toArray(colors, i * 3);
      sizes[i] = rnd(5, 20);
    }

    const attributes = [
      { name: "position", array: positions, itemSize: 3 },
      { name: "color", array: colors, itemSize: 3 },
      { name: "size", array: sizes, itemSize: 1 },
    ];

    const uniforms = { uTime: { value: 0 } };

    const clock = new Clock();

    const NUM_INSTANCES = 40;
    const instances = [];
    const target = new Vector3();
    const dummyO = new Object3D();
    const dummyV = new Vector3();
    for (let i = 0; i < NUM_INSTANCES; i++) {
      instances.push({
        position: new Vector3(rndFS(200), rndFS(200), rndFS(200)),
        scale: rnd(0.2, 1),
        scaleZ: rnd(0.7, 1),
        velocity: new Vector3(rndFS(20), rndFS(20), rndFS(20)),
        attraction: 0.4 + rnd(-0.01, 0.01),
        vlimit: 4.2 + rnd(-0.1, 0.1),
      });
    }

    return {
      POINTS_COUNT,
      attributes,
      uniforms,
      vertexShader,
      fragmentShader,
      clock,
      NUM_INSTANCES,
      instances,
      target,
      dummyO,
      dummyV,
    };
  },
  mounted() {
    const points = this.$refs.points.points;
    const title = this.$refs.title;
    this.textsize = Math.min(window.innerWidth, window.innerHeight) * 0.03;
    this.imesh = this.$refs.imesh.mesh;
    const positionN = this.$refs.renderer.three.pointer.positionN;
    const positionV3 = this.$refs.renderer.three.pointer.positionV3;
    for (let i = 0; i < this.NUM_INSTANCES; i++) {
      const { position, scale, scaleZ } = this.instances[i];
      this.dummyO.position.copy(position);
      this.dummyO.scale.set(scale, scale, scaleZ);
      this.dummyO.updateMatrix();
      this.imesh.setMatrixAt(i, this.dummyO.matrix);
    }
    this.imesh.instanceMatrix.needsUpdate = true;
    this.$refs.renderer.onBeforeRender(() => {
      this.timeCoef = lerp(this.timeCoef, this.targetTimeCoef, 0.02);
      this.uniforms.uTime.value += this.clock.getDelta() * this.timeCoef * 4;
      this.zoomStrength = this.timeCoef * 0.004;
      const da = 0.1;
      const tiltX = lerp(points.rotation.x, positionN.y * da, 0.02);
      const tiltY = lerp(points.rotation.y, -positionN.x * da, 0.02);
      points.rotation.set(tiltX, tiltY, 0);

      this.target.copy(positionV3);
      for (let i = 0; i < this.NUM_INSTANCES; i++) {
        const { position, scale, scaleZ, velocity, attraction, vlimit } =
          this.instances[i];
        this.dummyV
          .copy(this.target)
          .sub(position)
          .normalize()
          .multiplyScalar(attraction);
        velocity.add(this.dummyV).clampScalar(-vlimit, vlimit);
        position.add(velocity);
        this.dummyO.position.copy(position);
        this.dummyO.scale.set(scale, scale, scaleZ);
        this.dummyO.lookAt(this.dummyV.copy(position).add(velocity));
        this.dummyO.updateMatrix();
        this.imesh.setMatrixAt(i, this.dummyO.matrix);
      }
      this.imesh.instanceMatrix.needsUpdate = true;
    });
  },
  methods: {
    togglepopup(val) {
      this.cnt++;
      if (!val)
        if (this.cnt > 5) {
          this.invert = 100;
          setTimeout(() => {
            this.invert = 0;
          }, 1000);
        }
      this.showpopup = val;
    },
    touchMove(event) {
      this.mouseMove(event.touches[0]);
    },
    mouseMove(event) {
      if (this.targetTimeCoef != 40)
        this.targetTimeCoef = Math.min(
          Math.pow(
            4 *
              (1 -
                Math.abs(event.clientX - window.innerWidth / 2) /
                  (window.innerWidth / 2)),
            2
          ) +
            Math.pow(
              4 *
                (1 -
                  Math.abs(event.clientY - window.innerHeight / 2) /
                    (window.innerHeight / 2)),
              2
            ),
          25
        );
    },
    titleOver(e) {
      var t = this.stbyColor;
      this.stbyColor = this.envColor;
      this.envColor = t;
      if (e.over) this.targetTimeCoef = 40;
      else this.targetTimeCoef = 39.9;
    },
    randomColors() {
      this.updateColors(randInt(0, niceColors.length - 1));
    },
    updateColors(ip = 83) {
      const colorAttribute = this.$refs.points.geometry.attributes.color;
      if (ip == -1) ip = randInt(1, 99);
      const palette = niceColors[ip];
      const color = new Color();
      for (let i = 0; i < this.POINTS_COUNT; i++) {
        color.set(palette[randInt(0, palette.length)]);
        color.toArray(colorAttribute.array, i * 3);
      }
      colorAttribute.needsUpdate = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.bg {
  transition: 0.3s filter linear, 0.3s -webkit-filter linear;
  &.inv {
    filter: invert(100%);
  }
}
</style>
