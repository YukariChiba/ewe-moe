<template>
  <v-dialog
    :modelValue="show"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pa-6 d-flex flex-column">
      <div class="flex-grow-1" />
      <v-card-title class="text-center text-orange flex-shrink-2">
        <v-icon left>mdi-alert</v-icon> 光敏性癫痫警告
        <br />
        <small>
          <v-icon left>mdi-alert</v-icon> Photosensitive Epilepsy Warning
        </small>
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
        <br />
        <p>
          A very small percentage of people may experience epileptic seizures or
          blackouts when exposed to certain kinds of flashing lights or light
          patterns. These persons, or even people who have no history of
          seizures or epilepsy, may experience epileptic symptoms or seizures
          while viewing this content.
        </p>
        <p>
          Seizures may have a variety of symptoms, including mild headaches,
          blurred vision, eye or facial twitching, spasms or shaking of the
          limbs, disorientation, confusion or temporary loss of consciousness.
          Seizures may also result in loss of consciousness or convulsions,
          which in turn may cause the person to suffer injuries from falling or
          striking a nearby object.
        </p>
        <p>
          If you experience any of these symptoms, stop viewing this page
          immediately and consult your doctor. Parents should watch for or ask
          their children if they experience any of these symptoms. Children and
          adolescents are more likely to experience seizures than adults. You
          may reduce risk of photosensitive epileptic seizures by taking the
          following precautions: sit farther from the screen; use a smaller
          screen; view this page in a well-lit room; and do not view this page
          when drowsy or fatigued.
        </p>
        <p>
          If you or any of your relatives has an epileptic condition or has had
          seizures of any kind, consult your physician before viewing this
          content.
        </p>
      </v-card-text>
      <v-card-actions class="justify-center flex-shrink-1 pa-0">
        <v-btn
          class="pa-4"
          block
          size="x-large"
          @click="close"
          :disabled="cnt > 0"
        >
          <span class="hidden-md-and-up">
            知悉并关闭 / Ack & Close {{ cnt > 0 ? "(" + cnt + ")" : "" }}
          </span>
          <span class="hidden-sm-and-down">
            我已知悉，点击此处以关闭 / I am aware of this, click here to close {{ cnt > 0 ? "(" + cnt + ")" : "" }}
          </span>
        </v-btn>
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
.v-card-title,
.v-btn {
  background-color: rgba(0, 0, 0, 0.5);
}

.v-card-text {
  opacity: 1;
}
</style>
