export default (entry: any) => {
  const seo = {
    title: entry?.seoTitle || entry?.title,
    description: entry?.seoDescription || entry?.description,
    image: entry?.seoImage?.[0]?.url || entry?.image,
  };

  const { name: siteName, separator, tagline } = useSiteConfig();

  const meta = {
    ...(seo.title && { title: seo.title }),
    ...(seo.title && { ogTitle: seo.title }),
    ...(seo.description && { description: seo.description }),
    ...(seo.description && { ogDescription: seo.description }),
    ...(seo.image && { ogImage: seo.image }),
    ...(seo.image && { twitterImageSrc: seo.image }),
    twitterCard: "summary_large_image",
    titleTemplate: (titleChunk: string) => {
      return entry.slug === "home" || !entry.slug
        ? `%siteName %separator ${tagline}`
        : "%s %separator %siteName";
    },
  };

  useSeoMeta(meta);
};

export function seoText(text: string, maxLength: number = 160) {
  if (text) {
    let cleanText = text.replace(/<[^>]*>/g, "");

    if (cleanText.length <= maxLength) {
      return cleanText.trim();
    }

    const truncatedText = cleanText.slice(0, maxLength + 1);
    const lastSpaceIndex = truncatedText.lastIndexOf(" ");

    const finalText = lastSpaceIndex > -1 ? truncatedText.slice(0, lastSpaceIndex) : truncatedText;

    return finalText.trim();
  }
}
