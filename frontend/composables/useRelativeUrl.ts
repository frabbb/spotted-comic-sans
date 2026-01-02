export default (url: string) => {
  const config = useRuntimeConfig();
  return url?.replace(config.public.baseUrl, "/");
};
