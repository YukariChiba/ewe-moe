import { TroisJSVuePlugin } from "troisjs";
import { createApp } from "vue";
import vuetify from "./plugins/vuetify";
import App from "./App.vue";

const app = createApp(App);

app.use(vuetify);
app.use(TroisJSVuePlugin);

app.mount("#app");
