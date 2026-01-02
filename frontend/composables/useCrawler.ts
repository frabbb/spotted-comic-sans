export default (userAgent = "") => {
  if (!userAgent) return false;

  const crawlerPatterns = [
    /bot/i,
    /spider/i,
    /crawl/i,
    /slurp/i,
    /bingpreview/i,
    /yandex/i,
    /duckduckbot/i,
    /baiduspider/i,
    /sogou/i,
    /exabot/i,
    /facebot/i,
    /ia_archiver/i,
  ];

  return crawlerPatterns.some((pattern) => pattern.test(userAgent));
};
