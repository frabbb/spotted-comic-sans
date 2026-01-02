export default defineEventHandler(async (event) => {
  const storage = useStorage();
  const cacheKeys = await storage.getKeys("cache/nitro/functions/data");

  const body = await readBody(event);
  const prefixKeys = [];

  if (body.type === "project") {
    prefixKeys.push("page-home");
  }

  if (prefixKeys.length) {
    const clearKeys = cacheKeys.filter((k) =>
      prefixKeys.some((p) => k.startsWith(`cache:nitro:functions:data:${p}`))
    );

    await Promise.all(clearKeys.map((key) => storage.removeItem(key)));
    return { clearKeys };
  }
});
