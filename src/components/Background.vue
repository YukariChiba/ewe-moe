<template>
  <div :class="invert ? 'bg inv' : 'bg'">
    <Renderer
      :antialias="true"
      ref="renderer"
      pointer
      resize="window"
      @mousemove="mouseMove"
      @wheel="randomColors"
      @touchmove="touchMove"
    >
      <Camera :position="{ z: 200 }" :fov="50" />
      <Scene>
        <AmbientLight color="#808080" :intensity="0.5" />
        <PointLight
          ref="light"
          :color="envColor"
          :intensity="0.3"
          :position="lightposition"
        />
        <Text
          ref="title"
          @pointerOver="titleOver"
          :text="info.title"
          font-src="/assets/font.json"
          align="center"
          :size="
            introcnt.length > NUM_INTRO_INSTANCES * 0.8
              ? textsize
              : (textsize * introcnt.length) / (NUM_INTRO_INSTANCES * 0.8)
          "
          @click="togglepopup(true)"
          :height="0"
          :position="{ x: 0, y: 10, z: 100 }"
        >
          <PhongMaterial color="#666666" />
        </Text>
        <Text
          v-if="cnt > 5"
          ref="title_extra"
          :text="info.title"
          font-src="/assets/font.json"
          align="center"
          :size="extrasize"
          :height="0"
          :position="{ x: 0, y: 10, z: 80 }"
        >
          <PhongMaterial
            color="#666666"
            :props="{
              transparent: true,
              opacity: 0.2,
            }"
          />
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
        <InstancedMesh ref="lines" :count="NUM_LINE_INSTANCES">
          <ConeGeometry :radius="1" :height="300" :radialSegments="32" />
          <StandardMaterial
            :props="{
              transparent: true,
              opacity: cnt > 10 ? 0.7 : 0,
              metalness: 0.4,
              roughness: 1,
            }"
          />
        </InstancedMesh>
        <InstancedMesh
          ref="intro"
          v-if="introshow"
          :count="NUM_INTRO_INSTANCES"
        >
          <SphereGeometry :radius="4" />
          <StandardMaterial
            color="#666666"
            :props="{
              transparent: true,
              opacity: Math.pow(
                1 - introcnt.length / NUM_INTRO_INSTANCES / 1.5,
                2
              ),
              metalness: 0,
              roughness: 0.5,
            }"
          />
        </InstancedMesh>
        <InstancedMesh ref="imesh" :count="NUM_INSTANCES">
          <BoxGeometry :width="1" :height="2" :depth="15" />
          <StandardMaterial
            :props="{
              transparent: true,
              opacity: cnt > 5 ? 0.9 : 0,
              metalness: 0.7,
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
    extrasize: 30,
    info: info,
    targetTimeCoef: 1,
    envColor: "#0060ff",
    stbyColor: "#ff0000",
    showpopup: false,
    invert: 0,
    cnt: 0,
    introshow: true,
    introcnt: [],
    hint: null,
    lightposition: { x: 0, y: 0, z: 200 },
    linespeed: new Vector3(0, 0, 4),
    NUM_INSTANCES: 40,
    NUM_LINE_INSTANCES: 30,
    NUM_INTRO_INSTANCES: 300,
    instances: [],
    lineinstances: [],
    introinstances: [],
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
      let rand = rnd(5, 20);
      if (rand > 19.7) rand = rnd(40, 70);
      sizes[i] = rand;
    }

    const attributes = [
      { name: "position", array: positions, itemSize: 3 },
      { name: "color", array: colors, itemSize: 3 },
      { name: "size", array: sizes, itemSize: 1 },
    ];

    const uniforms = { uTime: { value: 0 } };

    const clock = new Clock();

    const target = new Vector3();
    const dummyO = new Object3D();
    const dummyV = new Vector3();

    return {
      POINTS_COUNT,
      attributes,
      uniforms,
      clock,
      target,
      dummyO,
      dummyV,
    };
  },
  mounted() {
    const points = this.$refs.points.points;
    this.textsize = Math.min(window.innerWidth, window.innerHeight) * 0.03;
    this.imesh = this.$refs.imesh.mesh;
    this.intro = this.$refs.intro.mesh;
    this.lines = this.$refs.lines.mesh;
    const positionN = this.$refs.renderer.three.pointer.positionN;
    const positionV3 = this.$refs.renderer.three.pointer.positionV3;
    for (let i = 0; i < this.NUM_INSTANCES; i++) {
      this.instances.push({
        position: new Vector3(rndFS(200), rndFS(200), rndFS(200)),
        scale: rnd(0.2, 1),
        scaleZ: rnd(0.7, 1),
        velocity: new Vector3(rndFS(20), rndFS(20), rndFS(20)),
        attraction: 0.2 + rnd(-0.01, 0.01),
        vlimit: 3.2 + rnd(-0.1, 0.1),
      });
    }
    for (let i = 0; i < this.NUM_INSTANCES; i++) {
      const { position, scale, scaleZ } = this.instances[i];
      this.dummyO.position.copy(position);
      this.dummyO.scale.set(scale, scale, scaleZ);
      this.dummyO.updateMatrix();
      this.intro.setMatrixAt(i, this.dummyO.matrix);
    }
    for (let i = 0; i < this.NUM_INTRO_INSTANCES; i++) {
      const dummyO = new Object3D();
      const position = new Vector3(rndFS(500), rndFS(500), rndFS(500) - 200);
      this.introinstances.push(position);
      const scale = Math.pow((i % 10) / 5, 2) + 1.5;
      dummyO.scale.set(scale, scale, scale);
      dummyO.position.copy(position);
      dummyO.updateMatrix();
      this.lines.setMatrixAt(i, dummyO.matrix);
    }
    for (let i = 0; i < this.NUM_LINE_INSTANCES; i++) {
      const dummyO = new Object3D();
      const position = new Vector3(rndFS(200), rndFS(200), rndFS(300) - 500);
      this.lineinstances.push(position);
      const scale = rnd(0.2, 1);
      const scaleZ = rnd(0.7, 1);
      dummyO.position.copy(position);
      dummyO.scale.set(scale, scale, scaleZ);
      dummyO.updateMatrix();
      this.lines.setMatrixAt(i, dummyO.matrix);
    }
    this.imesh.instanceMatrix.needsUpdate = true;
    this.$refs.renderer.onBeforeRender(() => {
      this.timeCoef = lerp(this.timeCoef, this.targetTimeCoef, 0.02);
      this.uniforms.uTime.value += this.clock.getDelta() * this.timeCoef * 4;
      this.zoomStrength = this.timeCoef * 0.004;
      const da = 0.3;
      const tiltX = lerp(points.rotation.x, positionN.y * da, 0.02);
      const tiltY = lerp(points.rotation.y, -positionN.x * da, 0.02);
      points.rotation.set(tiltX, tiltY, 0);
      this.lines.rotation.set(tiltX, tiltY, 0);
      if (this.$refs.title.mesh)
        this.$refs.title.mesh.rotation.set(tiltX * 2, tiltY * 2, 0);
      if (this.cnt > 5)
        if (this.$refs.title_extra.mesh)
          this.$refs.title_extra.mesh.rotation.set(tiltX * 2, tiltY * 2, 0);

      this.target.copy(positionV3);
      this.lightposition.x = positionV3.x;
      this.lightposition.y = positionV3.y;
      if (this.introshow) {
        if (this.introcnt.length >= this.NUM_INTRO_INSTANCES * 0.8)
          setTimeout(() => {
            this.introshow = false;
          }, 1000);
        for (let i = 0; i < this.NUM_INTRO_INSTANCES; i++) {
          const dummyO = new Object3D();
          dummyO.position.copy(this.introinstances[i]);
          dummyO.position.x = lerp(dummyO.position.x, 0, 0.02 + (i % 10) / 200);
          dummyO.position.y = lerp(
            dummyO.position.y,
            10,
            0.02 + (i % 10) / 200
          );
          dummyO.position.z = lerp(
            dummyO.position.z,
            10,
            0.02 + (i % 10) / 200
          );
          const scale = (i % 10) / 5 + 1;
          dummyO.scale.set(scale, scale, scale);
          dummyO.updateMatrix();
          this.intro.setMatrixAt(i, dummyO.matrix);
          this.introinstances[i].copy(dummyO.position);
          if (!this.introcnt.includes(i))
            if (
              Math.abs(dummyO.position.x) < 10 &&
              Math.abs(dummyO.position.y - 10) < 10
            ) {
              this.introcnt.push(i);
            }

          this.intro.instanceMatrix.needsUpdate = true;
        }
      }
      if (this.cnt > 5) {
        if (this.extrasize < this.textsize * 0.8 * 1.8 + 10) {
          this.extrasize = lerp(
            this.extrasize,
            this.textsize * 0.8 * 1.8 + 10,
            0.02
          );
        }
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
      }
      if (this.cnt > 10) {
        for (let i = 0; i < this.NUM_LINE_INSTANCES; i++) {
          const dummyO = new Object3D();
          dummyO.position.copy(this.lineinstances[i]);
          if (dummyO.position.z < 300) {
            dummyO.position.add(this.linespeed);
          } else {
            dummyO.position.copy(
              new Vector3(rndFS(200), rndFS(200), rndFS(300) - 300)
            );
          }
          dummyO.rotation.set(-Math.PI / 2, 0, 0, "XYZ");
          dummyO.updateMatrix();
          this.lines.setMatrixAt(i, dummyO.matrix);
          this.lineinstances[i].copy(dummyO.position);
        }
        this.lines.instanceMatrix.needsUpdate = true;
      }
      this.imesh.instanceMatrix.needsUpdate = true;
    });
  },
  methods: {
    togglepopup(val) {
      this.cnt++;
      if (!val)
        if (this.cnt > 5) {
          setTimeout(() => {
            this.invert = 100;
            setTimeout(() => {
              this.invert = 0;
            }, 1300);
          }, 300);
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
      if (e.over) {
        this.linespeed.z = this.linespeed.z + 4;
        this.targetTimeCoef = 40;
      } else {
        this.linespeed.z = this.linespeed.z - 4;
        this.targetTimeCoef = 39.9;
      }
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
    filter: invert(100%) brightness(1.5) hue-rotate(90deg);
  }
}
</style>
