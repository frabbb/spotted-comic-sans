import siteQuery from "@/graphql/queries/sanity/singles/site";
import footerQuery from "@/graphql/queries/sanity/singles/footer";
import headerQuery from "@/graphql/queries/sanity/singles/header";
import projectsArchive from "@/graphql/queries/sanity/singles/projects-archive";

export default async (locale: string) => {
  const [
    { data: siteData },
    { data: headerData },
    { data: footerData },
    { data: projectsArchiveData },
  ] = await Promise.all([
    useData({
      key: `site`,
      query: siteQuery,
      variables: {},
      locale: locale,
    }),
    useData({
      key: `single-header`,
      query: headerQuery,
      variables: {},
      locale: locale,
    }),
    useData({
      key: `single-footer`,
      query: footerQuery,
      variables: {},
      locale: locale,
    }),
    useData({
      key: `single-projects-archive`,
      query: projectsArchive,
      variables: {
        slug: "projects",
      },
      locale: locale,
    }),
  ]);

  return { siteData, headerData, footerData, projectsArchiveData };
};
