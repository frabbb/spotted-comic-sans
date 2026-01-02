export default () => {
  const device = ref();

  onMounted(() => {
    device.value = {
      touch: window.matchMedia("(hover: none)").matches,
      safari: !!(
        navigator.vendor &&
        navigator.vendor.indexOf("Apple") > -1 &&
        navigator.userAgent &&
        navigator.userAgent.indexOf("CriOS") == -1 &&
        navigator.userAgent.indexOf("FxiOS") == -1
      ),
    };
  });

  return device;
};
