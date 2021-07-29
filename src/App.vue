<template>
  <div>
    <v-app class="app">
      <v-main>
        <BottomNav />
      </v-main>
      <Background class="bg" />
    </v-app>
  </div>
</template>

<script>
import Background from "./components/Background.vue";
import BottomNav from "./components/BottomNav.vue";

export default {
  components: { Background, BottomNav },
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
