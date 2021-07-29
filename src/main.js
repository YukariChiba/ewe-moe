import { createApp } from "troisjs";
import vuetify from "./plugins/vuetify";
import App from "./App.vue";

const app = createApp(App);

app.use(vuetify);

app.mount("#app");
