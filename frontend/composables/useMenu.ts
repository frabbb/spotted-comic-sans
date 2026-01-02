export default () => {
  const state = useState(`menu`, () => false);
  const { s } = useMq();

  watch(s, (v) => {
    if (v) {
      state.value = false;
    }
  });
  return state;
};
