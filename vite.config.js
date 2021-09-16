import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "@vuetify/vite-plugin";

export default defineConfig({
  server: { host: "0.0.0.0" },
  plugins: [vue(),vuetify({ autoImport: true })],
  define: { "process.env": {} },
});
