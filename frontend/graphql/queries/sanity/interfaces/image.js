export default /* GraphQL */ `
  fragment ImageInterface on ImageAsset {
    type: _type
    id: _id
    title
    image {
      asset {
        url
        extension
        metadata {
          dimensions {
            height
            width
            aspectRatio
          }
        }
      }
    }
    description
  }
`;
