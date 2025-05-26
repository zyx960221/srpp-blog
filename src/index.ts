import "./index.css";
import router from "./router";
import { createApp } from "vue";
import App from "./App.vue";

console.log("这里永远欢迎你 ·-·");

const app = createApp(App);

app.use(router);
app.mount("#root");
