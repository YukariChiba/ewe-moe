<template>
  <div :class="invert ? 'bg inv' : 'bg'">
    <Renderer
      :antialias="true"
      ref="renderer"
      pointer
      resize="window"
      @mousemove="mouseMove"
      @wheel="updateColors(-1)"
      @touchmove="touchMove"
    >
      <Camera :position="cfg.cam.ref_position" :fov="cfg.cam.fov" />
      <Scene>
        <AmbientLight
          :color="cfg.light.ambient.color"
          :intensity="cfg.light.ambient.intensity"
        />
        <PointLight
          ref="light"
          :color="envColor"
          :intensity="cfg.light.point.intensity"
          :position="lightposition"
        />
        <Text
          ref="title"
          @pointerOver="titleOver"
          :text="info.title"
          font-src="/assets/font.json"
          align="center"
          :size="
            introcnt.length > cfg.intro.count * 0.8
              ? textsize
              : (textsize * introcnt.length) / (cfg.intro.count * 0.8)
          "
          @click="togglepopup(true)"
          :height="0"
          :position="cfg.title.ref_position"
        >
          <PhongMaterial :color="cfg.title.material.color" />
        </Text>
        <Text
          v-if="clickcnt > cfg.extra.stage1_click_count"
          ref="title_extra"
          :text="info.title"
          font-src="/assets/font.json"
          align="center"
          :size="extrasize"
          :height="0"
          :position="cfg.extra_title.ref_position"
        >
          <PhongMaterial
            :color="cfg.extra_title.material.color"
            :props="{
              transparent: true,
              opacity: cfg.extra_title.material.opacity,
            }"
          />
        </Text>
        <Points ref="points" :position="cfg.point.ref_position">
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
        <InstancedMesh ref="lines" :count="cfg.line.count">
          <ConeGeometry
            :radius="cfg.line.radius"
            :height="cfg.line.length"
            :radialSegments="32"
          />
          <StandardMaterial
            :props="{
              transparent: true,
              opacity:
                clickcnt > cfg.extra.stage2_click_count
                  ? cfg.line.material.opacity
                  : 0,
              metalness: cfg.line.material.metalness,
              roughness: cfg.line.material.roughness,
            }"
          />
        </InstancedMesh>
        <InstancedMesh ref="intro" v-if="introshow" :count="cfg.intro.count">
          <SphereGeometry :radius="cfg.intro.radius" />
          <StandardMaterial
            :color="cfg.intro.material.color"
            :props="{
              transparent: true,
              opacity: Math.pow(1 - introcnt.length / cfg.intro.count / 1.5, 2),
              metalness: cfg.intro.material.metalness,
              roughness: cfg.intro.material.roughness,
            }"
          />
        </InstancedMesh>
        <InstancedMesh ref="cursor" :count="cfg.cursor.count">
          <BoxGeometry
            :width="cfg.cursor.radius"
            :height="cfg.cursor.length"
            :depth="15"
          />
          <StandardMaterial
            :props="{
              transparent: true,
              opacity:
                clickcnt > cfg.extra.stage1_click_count
                  ? cfg.cursor.material.opacity
                  : 0,
              metalness: cfg.cursor.material.metalness,
              roughness: cfg.cursor.material.metalness,
            }"
          />
        </InstancedMesh>
      </Scene>
      <EffectComposer>
        <RenderPass />
        <UnrealBloomPass
          :strength="cfg.effects.blur.strength"
          :radius="cfg.effects.blur.radius"
          :threshold="cfg.effects.blur.threshold"
        />
        <ZoomBlurPass :strength="timeCoef * cfg.effects.zoom.coef" />
        <FilmPass
          :noiseIntensity="cfg.effects.film.noise"
          :scanlinesIntensity="cfg.effects.film.scan_intensity"
          :scanlinesCount="cfg.effects.film.scan_count"
          :grayscale="cfg.effects.film.grayscale"
          v-if="showpopup"
        />
      </EffectComposer>
    </Renderer>
    <Popup
      :show="showpopup"
      @pclose="togglepopup(false)"
      @pattern="updateColors"
      :cnt="clickcnt"
    />
  </div>
</template>

<script>
import { vertexShader, fragmentShader } from "../data/shaders";
import { Object3D, Clock, MathUtils, Vector3 } from "three";
import { lerp } from "troisjs";
const { randFloat: rnd } = MathUtils;

import info from "../data/info.json";
import cfg from "../data/3dconfig.json";
import {
  point_size_rand,
  point_position_rand,
  point_color_rand,
  time_coef_update,
  rotation_update,
  object_matrix_update,
  vector_rand,
} from "../utils/render_helper";
import Popup from "./Popup.vue";

export default {
  components: { Popup },
  data: () => ({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: { uTime: { value: 0 } },
    textsize: 30,
    extrasize: 30,
    info: info,
    timeCoef: 1,
    targetTimeCoef: 1,
    envColor: cfg.light.point.colors.standard,
    showpopup: false,
    invert: 0,
    clickcnt: 0,
    introshow: true,
    introcnt: [],
    lightposition: { x: 0, y: 0, z: cfg.light.point.position_z },
    linespeed: new Vector3(0, 0, cfg.line.speed_zs.standard),
    instances: [],
    lineinstances: [],
    introinstances: [],
    cfg: cfg,
    clock: new Clock(),
  }),
  setup() {
    const POINTS_COUNT =
      Math.sqrt(window.innerWidth * window.innerHeight) * cfg.point.count_coef;

    const positions = new Float32Array(POINTS_COUNT * 3);
    const colors = new Float32Array(POINTS_COUNT * 3);
    const sizes = new Float32Array(POINTS_COUNT);

    for (let i = 0; i < POINTS_COUNT; i++) {
      point_position_rand(cfg).toArray(positions, i * 3);
      point_color_rand(cfg).toArray(colors, i * 3);
      sizes[i] = point_size_rand(cfg);
    }

    const attributes = [
      { name: "position", array: positions, itemSize: 3 },
      { name: "color", array: colors, itemSize: 3 },
      { name: "size", array: sizes, itemSize: 1 },
    ];

    return {
      POINTS_COUNT,
      attributes,
    };
  },
  mounted() {
    const points = this.$refs.points.points;
    this.textsize =
      Math.min(window.innerWidth, window.innerHeight) * cfg.title.size_coef;
    this.cursor = this.$refs.cursor.mesh;
    this.intro = this.$refs.intro.mesh;
    this.lines = this.$refs.lines.mesh;
    const positionN = this.$refs.renderer.three.pointer.positionN;
    const positionV3 = this.$refs.renderer.three.pointer.positionV3;
    for (let i = 0; i < this.cfg.cursor.count; i++) {
      this.instances.push({
        position: vector_rand(this.cfg.cursor.init_positions),
        scale: rnd(0.2, 1),
        scaleZ: rnd(0.7, 1),
        velocity: vector_rand([20, 20, 20]),
        attraction: 0.2 + rnd(-0.01, 0.01),
        vlimit: 3.2 + rnd(-0.1, 0.1),
      });
    }
    for (let i = 0; i < this.cfg.cursor.count; i++) {
      const { position, scale, scaleZ } = this.instances[i];
      object_matrix_update(this.intro, i, position, [scale, scale, scaleZ]);
    }
    for (let i = 0; i < this.cfg.intro.count; i++) {
      const position = vector_rand(
        this.cfg.intro.init_positions,
        this.cfg.intro.init_positions_offset
      );
      this.introinstances.push(position);
      const scale = Math.pow((i % 10) / 5, 2) + 1.5;
      object_matrix_update(this.intro, i, position, [scale, scale, scale]);
    }
    for (let i = 0; i < this.cfg.line.count; i++) {
      const position = vector_rand(
        this.cfg.line.init_positions,
        this.cfg.line.init_positions_offset
      );
      this.lineinstances.push(position);
      const scale = rnd(0.2, 1);
      const scaleZ = rnd(0.7, 1);
      object_matrix_update(this.lines, i, position, [scale, scale, scaleZ]);
    }
    this.cursor.instanceMatrix.needsUpdate = true;
    this.$refs.renderer.onBeforeRender(() => {
      this.timeCoef = lerp(
        this.timeCoef,
        this.targetTimeCoef,
        this.cfg.time.lerp
      );
      this.uniforms.uTime.value += this.clock.getDelta() * this.timeCoef * 4;
      const da = this.cfg.rotation.coef;
      const tiltX = lerp(points.rotation.x, positionN.y * da, 0.02);
      const tiltY = lerp(points.rotation.y, -positionN.x * da, 0.02);

      rotation_update(points, tiltX, tiltY);
      rotation_update(this.lines, tiltX, tiltY);
      rotation_update(this.$refs.title.mesh, tiltX, tiltY, 2);
      if (this.clickcnt > this.cfg.extra.stage1_click_count)
        rotation_update(this.$refs.title_extra.mesh, tiltX, tiltY, 2);

      const target = new Vector3();
      target.copy(positionV3);
      this.lightposition.x = positionV3.x;
      this.lightposition.y = positionV3.y;
      if (this.introshow) {
        if (this.introcnt.length >= this.cfg.intro.count * 0.8)
          setTimeout(() => {
            this.introshow = false;
          }, 1000);
        for (let i = 0; i < this.cfg.intro.count; i++) {
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
      if (this.clickcnt > this.cfg.extra.stage1_click_count) {
        if (this.extrasize < this.textsize * 0.8 * 1.8 + 10) {
          this.extrasize = lerp(
            this.extrasize,
            this.textsize * 0.8 * 1.8 + 10,
            0.02
          );
        }
        for (let i = 0; i < this.cfg.cursor.count; i++) {
          const { position, scale, scaleZ, velocity, attraction, vlimit } =
            this.instances[i];
          const dummyV = new Vector3();
          dummyV
            .copy(target)
            .sub(position)
            .normalize()
            .multiplyScalar(attraction);
          velocity.add(dummyV).clampScalar(-vlimit, vlimit);
          position.add(velocity);
          object_matrix_update(
            this.cursor,
            i,
            position,
            [scale, scale, scaleZ],
            dummyV.copy(position).add(velocity)
          );
        }
      }
      if (this.clickcnt > this.cfg.extra.stage2_click_count) {
        for (let i = 0; i < this.cfg.line.count; i++) {
          const dummyO = new Object3D();
          dummyO.position.copy(this.lineinstances[i]);
          if (dummyO.position.z < 300) {
            dummyO.position.add(this.linespeed);
          } else {
            dummyO.position.copy(
              vector_rand(
                this.cfg.line.init_positions,
                this.cfg.line.init_positions_offset
              )
            );
          }
          dummyO.rotation.set(-Math.PI / 2, 0, 0, "XYZ");
          dummyO.updateMatrix();
          this.lines.setMatrixAt(i, dummyO.matrix);
          this.lineinstances[i].copy(dummyO.position);
        }
        this.lines.instanceMatrix.needsUpdate = true;
      }
      this.cursor.instanceMatrix.needsUpdate = true;
    });
  },
  methods: {
    togglepopup(val) {
      this.clickcnt++;
      if (!val)
        if (this.clickcnt > this.cfg.extra.stage1_click_count) {
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
      this.targetTimeCoef = time_coef_update(
        this.cfg,
        event,
        this.targetTimeCoef
      );
    },
    titleOver(e) {
      if (e.over) {
        this.envColor = this.cfg.light.point.colors.active;
        this.linespeed.z = this.cfg.line.speed_zs.active;
        this.targetTimeCoef = this.cfg.time.coef_max;
      } else {
        this.envColor = this.cfg.light.point.colors.standard;
        this.linespeed.z = this.cfg.line.speed_zs.standard;
        this.targetTimeCoef = this.cfg.time.coef_max - 0.01;
      }
    },
    updateColors(ip = null) {
      const colorAttribute = this.$refs.points.geometry.attributes.color;
      for (let i = 0; i < this.POINTS_COUNT; i++) {
        point_color_rand(cfg, ip).toArray(colorAttribute.array, i * 3);
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
