<template>
  <div>
    <Renderer
      ref="renderer"
      pointer
      resize="window"
      @mousemove="mouseMove"
      @touchmove="touchMove"
    >
      <Camera :position="{ z: 0 }" :fov="50" />
      <Scene>
        <AmbientLight color="#808080" :intensity="0.5" />
        <PointLight ref="light" :color="envColor" :intensity="0.5" />
        <Text
          ref="title"
          @pointerOver="titleOver"
          :text="info.title"
          font-src="/assets/font.json"
          align="center"
          :size="textsize"
          @click="togglepopup(true)"
          :height="5"
          :position="{ x: 0, y: 10, z: -100 }"
        >
          <PhongMaterial color="#666666" />
        </Text>
        <Points ref="points" :position="{ z: -150 }">
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
      </Scene>
      <EffectComposer>
        <RenderPass />
        <UnrealBloomPass :strength="2" :radius="0" :threshold="0" />
        <ZoomBlurPass :strength="zoomStrength" />
        <FilmPass
          :noiseIntensity="5"
          :scanlinesIntensity="0.05"
          :scanlinesCount="1024"
          :grayscale="0"
          v-if="showpopup"
        />
      </EffectComposer>
    </Renderer>
    <Popup :show="showpopup" @pclose="togglepopup(false)" />
  </div>
</template>

<script>
import { vertexShader, fragmentShader } from "../data/shaders";

import { Clock, Color, MathUtils, Vector3 } from "three";

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
  }),
  setup() {
    const POINTS_COUNT = 40000;

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

    return {
      POINTS_COUNT,
      attributes,
      uniforms,
      vertexShader,
      fragmentShader,
      clock,
    };
  },
  mounted() {
    const renderer = this.$refs.renderer;
    const positionN = renderer.three.pointer.positionN;
    const points = this.$refs.points.points;
    const title = this.$refs.title;
    this.textsize = Math.min(window.innerWidth, window.innerHeight) * 0.03;
    renderer.onBeforeRender(() => {
      this.timeCoef = lerp(this.timeCoef, this.targetTimeCoef, 0.02);
      this.uniforms.uTime.value += this.clock.getDelta() * this.timeCoef * 4;
      this.zoomStrength = this.timeCoef * 0.004;

      const da = 0.05;
      const tiltX = lerp(points.rotation.x, positionN.y * da, 0.02);
      const tiltY = lerp(points.rotation.y, -positionN.x * da, 0.02);
      points.rotation.set(tiltX, tiltY, 0);
    });
  },
  methods: {
    togglepopup(val) {
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
