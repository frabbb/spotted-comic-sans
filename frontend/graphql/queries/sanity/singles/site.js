// GROQ query for site singleton
export default `*[_type == "site"][0] {
  _id,
  name,
  tagline,
  description,
  "social": social->{
    _type,
    _id,
    title,
    "image": {
      "asset": image.asset->{
        url,
        "extension": extension,
        "metadata": {
          "dimensions": {
            "height": metadata.dimensions.height,
            "width": metadata.dimensions.width,
            "aspectRatio": metadata.dimensions.aspectRatio
          }
        }
      }
    },
    description
  },
  bannerActive,
  bannerHeading,
  bannerTextRaw,
  "bannerMedia": bannerMedia->{
    _type,
    _id,
    title,
    description,
    _type == "imageAsset" => {
      "image": {
        "asset": image.asset->{
          url,
          "extension": extension,
          "metadata": {
            "dimensions": {
              "height": metadata.dimensions.height,
              "width": metadata.dimensions.width,
              "aspectRatio": metadata.dimensions.aspectRatio
            }
          }
        }
      }
    },
    _type == "videoAsset" => {
      "file": {
        "asset": file.asset->{
          url,
          "extension": extension
        }
      }
    }
  },
  "bannerLink": bannerLink {
    _type,
    title,
    url
  }
}`;
