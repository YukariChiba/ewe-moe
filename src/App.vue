<template>
  <div>
    <v-app class="app">
      <Warning :show="!show" @dialogClose="show = true" />
      <v-main v-if="show">
        <BottomNav />
      </v-main>
      <Background v-if="show" class="bg" />
    </v-app>
  </div>
</template>

<script>
import Background from "./components/Background.vue";
import BottomNav from "./components/BottomNav.vue";
import Warning from "./components/Warning.vue";

import { ifCrawler } from "./utils/crawler";

export default {
  data: () => ({
    show: false,
  }),
  mounted() {
    this.show = localStorage.getItem("warningClose") || false;
    if (ifCrawler()) this.show = true;
  },
  components: { Background, BottomNav, Warning },
};
</script>

<style>
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}

.bg {
  /* z-index: -999; */
  position: absolute;
  overflow: hidden;
}

.app {
  overflow: hidden;
}
</style>
