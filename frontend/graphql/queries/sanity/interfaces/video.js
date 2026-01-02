export default /* GraphQL */ `
  fragment VideoInterface on VideoAsset {
    type: _type
    id: _id
    title
    file {
      asset {
        url
        extension
      }
    }
    description
  }
`;
