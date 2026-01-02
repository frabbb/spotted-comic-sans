export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.warnHandler = (msg) => {
    if (
      msg.includes("style mismatch") ||
      msg.includes("attribute mismatch") ||
      msg.includes("class mismatch")
    ) {
      return;
    } else console.log(msg);
  };
});
