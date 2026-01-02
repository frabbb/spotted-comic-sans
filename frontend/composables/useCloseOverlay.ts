export default () => {
  const router = useRouter();
  const route = useRoute();
  if (route.meta.from) {
    router.push(route.meta.from);
  }
};
