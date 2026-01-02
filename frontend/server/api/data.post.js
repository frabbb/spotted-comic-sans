import { isPreview } from "@/utils";

const options = {
  maxAge: 60 * 60 * 24 * 30,
  staleMaxAge: -1,
  name: "data",
  getKey: (event) => {
    const query = getQuery(event);
    return query.key;
  },
  shouldBypassCache: (event) => {
    const config = useRuntimeConfig();
    if (!config.cache) return true;

    const query = getQuery(event);
    if (isPreview(query)) return true;
    return false;
  },
};

const cachedData = cachedFunction(async (event) => {
  const config = useRuntimeConfig();
  const url = config.public.sanityApi;

  const body = await readBody(event);
  const query = getQuery(event);

  return await $fetch(url, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(isPreview(query) ? { Authorization: `Bearer ${query.token}` } : {}),
    },
  });
}, options);

export default defineEventHandler(async (event) => await cachedData(event));
