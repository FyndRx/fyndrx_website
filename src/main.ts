import { createApp } from "vue";
import { createPinia } from "pinia";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import "./styles/global.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('[Sentry] VITE_SENTRY_DSN is not set — error tracking disabled.');
  } else {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

app.mount("#app");
