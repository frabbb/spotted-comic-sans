import tokens from "@/assets/css/tokens.json";

export default () => {
  const mq = useBreakpoints(tokens.theme.breakpoint);
  return mq;
};
