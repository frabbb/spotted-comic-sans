export default (key: string) => {
  const nuxtApp = useNuxtApp();

  const payload = computed(() => {
    const { data } = useNuxtData(`${key}-${nuxtApp.$i18n.locale.value}`);
    return data.value.data;
  });

  return payload;
};
