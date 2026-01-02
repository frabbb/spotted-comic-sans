import tokens from "@/assets/css/tokens.json";
const mq = useMq();
const { width, height } = useWindowSize();

const mqValue = (v: string | { [key: string]: string }, mq: any) => {
  let value;

  if (typeof v === "object") {
    const validValues = Object.entries(v)
      .filter(([key, value]) => {
        return mq[key]?.value || key === "default";
      })
      .map(([key, value]) => value);

    value = validValues[validValues.length - 1];
  } else value = v;

  if (!value) return NaN;

  if (value.includes("vh")) {
    value = (height.value * Number(value.replace(/vh/g, ""))) / 100;
  } else if (value.includes("vw")) {
    value = (width.value * Number(value.replace(/vw/g, ""))) / 100;
  } else if (value.includes("px")) {
    value = Number(value.replace(/px/g, ""));
  }

  return value;
};

export default computed(() =>
  Object.fromEntries(
    Object.entries(tokens.theme.spacing).map(([key, value]) => {
      return [key, mqValue(value, mq)];
    }),
  ),
);
