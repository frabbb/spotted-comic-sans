// GROQ projection for image assets - no longer needed as a fragment
// This is now embedded in the main queries
export default `{
  "type": _type,
  "id": _id,
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
}`;
