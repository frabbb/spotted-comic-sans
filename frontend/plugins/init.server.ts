import spotsQuery from "@/graphql/queries/sanity/entries/spots";

export default defineNuxtPlugin(async (nuxtApp) => {
  const userAgent = useRequestHeader("user-agent");
  useState("isCrawler", () => useCrawler(userAgent));

  // const { siteData } = await useSingles(nuxtApp.$i18n.locale.value);

  // const site = siteData?.value?.entry[0];

  // updateSiteConfig({
  //   name: site?.name,
  //   tagline: site?.tagline,
  // });

  // useSeo({
  //   title: site?.title,
  //   description: site?.description,
  //   image: parsedData(site?.social, "image")?.url,
  // });

  // useSchemaOrg([
  //   defineOrganization({
  //     name: site.title,
  //   }),
  //   defineWebSite({
  //     name: site.title,
  //     description: site.description,
  //   }),
  //   defineWebPage(),
  // ]);
});
