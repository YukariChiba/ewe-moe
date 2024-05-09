<template>
  <v-dialog :modelValue="show" persistent max-width="500">
    <v-card class="transparent-card">
      <v-card-title class="text-center avatar-section">
        <v-avatar :image="avatar" size="128" class="avatar" @click="pattern" />
      </v-card-title>
      <v-card-title class="text-h5 text-center">
        <div v-html="info.name" />
      </v-card-title>
      <v-card-title class="text-h6 text-center">
        <div v-html="info.namedesc" />
      </v-card-title>
      <v-card-text class="text-center">
        <div v-html="info.desc" />
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          variant="outlined"
          class="main-btn"
          color="green darken-1"
          block
          large
          text
          @click="pclose"
          ><v-icon>mdi-check</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import info from "../data/info.json";
import axios from "axios";
import avatar from "@/assets/avatar.jpg";

export default {
  props: ["show", "cnt"],
  data: () => ({
    info: info,
    avatar: avatar,
  }),
  watch: {
    show: function (val) {
      if (val == false) setTimeout(() => this.update_quote(), 300);
    },
  },
  methods: {
    update_quote() {
      axios
        .get("https://v1.hitokoto.cn/?c=a&min_length=10")
        .then((resp) => {
          if (resp.data.hitokoto)
            this.info.desc = resp.data.hitokoto.replace(/\r?\n/g, "<br />");
        })
        .catch();
    },
    pattern() {
      this.$emit("pattern", 100);
      setTimeout(() => {
        this.$emit("pattern", 83);
      }, 800 + (this.cnt > 5 ? 5000 : 0));
    },
    pclose() {
      this.$emit("pclose", true);
    },
  },
};
</script>

<style lang="scss" scoped>
.v-card {
  overflow: visible !important;
}

.avatar {
  position: relative;
  margin-bottom: -64px;
  top: -64px;
}

.avatar-section {
  overflow: visible;
}

.main-btn {
  background-color: rgba(0, 0, 0, 0.2);
}

.transparent-card {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}
</style>
