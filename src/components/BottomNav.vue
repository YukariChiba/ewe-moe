<template>
  <div>
    <v-bottom-navigation
      fixed
      grow
      class="mb-4 hidden-sm-and-down"
      elevation="0"
      app
    >
      <v-btn v-for="link in links" :key="link.title" :href="link.url">
        <span>{{ link.title }}</span>
        <v-icon>mdi-{{ link.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <v-card class="hidden-md-and-up nav-mobile" tile elevation="0">
      <v-card-actions>
        <v-row no-gutters justify="center" align="center">
          <v-col v-for="link in links" :key="link.title">
            <v-btn icon tile elevation="0" :href="link.url"
              ><v-icon>mdi-{{ link.icon }}</v-icon></v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import info from "../data/info.json";

export default {
  data: () => ({
    links: info.links,
  }),
};
</script>

<style lang="scss" scoped>
.nav-mobile {
  background-color: rgba(255, 0, 0, 0);
  z-index: 99;
  position: absolute;
  bottom: 10vh;
  width: 100%;
}

.v-bottom-navigation {
  background-color: rgba(255, 0, 0, 0);
}

.v-btn {
  background-color: rgba(255, 0, 0, 0);
  text-shadow: 0 0 10px #fff;
  &:before {
    box-shadow: unset;
  }
  &:hover {
    span {
      display: none;
    }
    text-shadow: 0 0 5px #ccc;
    transform: scale(2);
  }
}

.v-col {
  flex-grow: unset;
}
</style>
