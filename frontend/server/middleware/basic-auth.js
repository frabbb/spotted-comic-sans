import { appendHeader, createError, getHeader } from "h3";

export default defineEventHandler((event) => {
  const { basicAuth } = useRuntimeConfig();

  if (!basicAuth || (Array.isArray(basicAuth) && !basicAuth.length)) {
    return;
  }

  const validAuthHeaders =
    Array.isArray(basicAuth) && basicAuth.length
      ? basicAuth.map((item) => `Basic ${btoa(item)}`)
      : [`Basic ${btoa(basicAuth)}`];

  const authHeader = getHeader(event, "authorization");

  if (authHeader && validAuthHeaders.some((validAuthHeader) => validAuthHeader === authHeader)) {
    return;
  }

  appendHeader(event, "www-authenticate", 'Basic realm="Restricted access"');
  throw createError({ statusCode: 401, statusMessage: "Not authorized" });
});
