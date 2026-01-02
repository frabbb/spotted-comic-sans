export default async ({ key, query, variables, lazy = false, route = { query: {} }, locale }) => {
  const data = ref();
  const error = ref();

  const k = locale ? `${key}-${locale}` : key;

  const { data: dataFetch, error: errorFetch } = await useFetch("/api/data", {
    key: k,
    query: {
      key: k,
      ...route.query,
    },
    body: {
      query,
      variables: {
        ...variables,
        ...(locale && { site: locale }),
      },
    },
    method: "POST",
  });

  data.value = dataFetch.value?.data;
  error.value = dataFetch.value?.errors || errorFetch.value;

  if (error.value) console.error(error.value);

  return { data, error };
};
