import image from "@/graphql/queries/sanity/interfaces/image";
import video from "@/graphql/queries/sanity/interfaces/video";
import link from "@/graphql/queries/sanity/interfaces/link";

export default /* GraphQL */ `
  ${image}
  ${video}
  ${link}
  query {
    entry: allSite(limit: 1) {
      name
      tagline
      description
      social {
        ...ImageInterface
      }
      bannerActive
      bannerHeading
      bannerTextRaw
      bannerMedia {
        ...ImageInterface
        ...VideoInterface
      }
      bannerLink {
        ...LinkInterface
      }
    }
  }
`;
