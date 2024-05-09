<template>
  <v-dialog :modelValue="show" fullscreen scrollable transition="dialog-bottom-transition">
    <v-card class="pa-6 d-flex flex-column">
      <div class="flex-grow-1" />
      <v-card-title class="text-center text-orange flex-shrink-1">
        <v-icon left>mdi-alert</v-icon> 光敏性癫痫警告
      </v-card-title>
      <v-card-text class="warning mt-6 mb-4 flex-grow-1">
        <p>
          极小部分人可能会在看到本站点某些视觉图像时出现癫痫症状。甚至没有癫痫发作或癫痫病史的人，也可能具有可在观看这些内容时导致"光敏性癫痫发作"的未确诊病症。
        </p>
        <p>
          癫痫发作可能有多种症状，包括轻度头痛、视力模糊、眼睛或面部抽搐、四肢痉挛或发抖、定向障碍、神志不清或暂时失去意识。
          癫痫发作还可能导致意识丧失或痉挛，进而导致患者因跌倒或撞击到附近的物体而受伤。
        </p>
        <p>
          如果您出现任何这些症状，请立即停止浏览此页面并咨询医生。家长应留意或询问子女是否出现上述症状。儿童和青少年比成年人更容易出现癫痫发作的情况。通过采取以下预防措施可降低光敏性癫痫发作的风险：坐得更远离屏幕；使用较小的屏幕；在光线充足的房间里浏览本页面；当昏昏欲睡或疲劳时不要浏览本页面。
        </p>
        <p>
          如果您或您的亲人有过癫痫发作或癫痫病史，请在浏览本页面前咨询医生。
        </p>
      </v-card-text>
      <v-card-actions class="justify-center flex-shrink-1 pa-0">
        <v-btn
          class="pa-4"
          block
          size="x-large"
          @click="close"
          :disabled="cnt > 0"
          >我已知悉，点击此处以关闭 {{ cnt > 0 ? "(" + cnt + ")" : "" }}</v-btn
        >
      </v-card-actions>
      <div class="flex-grow-1" />
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["show"],
  data: () => ({
    cnt: 3,
  }),
  mounted() {
    this.timeloop();
  },
  methods: {
    timeloop() {
      if (this.cnt > 0) {
        setTimeout(() => {
          this.cnt--;
          this.timeloop();
        }, 1000);
      }
    },
    exit() {
      close();
    },
    close() {
      localStorage.setItem("warningClose", true);
      this.$emit("dialogClose");
    },
  },
};
</script>

<style lang="scss" scoped>
.v-dialog {
  z-index: 9999;
}
p {
  margin-top: 10px;
  margin-bottom: 10px;
}

.warning {
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.v-card {
  max-height: 100%;
  background: repeating-linear-gradient(
    -45deg,
    transparent 1px,
    rgba(255, 187, 0, 0.2) 4px,
    rgba(255, 187, 0, 0.2) 26px,
    transparent 27px,
    transparent 60px
  );
}

.v-card-actions {
  align-items: baseline;
}
.v-card-title, .v-btn {
  background-color: rgba(0, 0, 0, 0.5);
}

.v-card-text {
  opacity: 1;
}
</style>
