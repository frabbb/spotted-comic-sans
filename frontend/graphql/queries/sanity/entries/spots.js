export default `{
 "entries": *[
    _type == "spot" && 
    select(
      defined($media) => defined(media),
      true
    ) &&
    select(
      defined($after) => datetime > $after,
      true
    ) &&
    select(
      defined($before) => datetime < $before,
      true
    ) &&
    select(
      defined($fts) => media->description match $fts,
      true
    )
  ] 
  | order(datetime desc) 
  [
   $offset...$limit
  ] {
    "id": _id,
    title,
    datetime,
    member->{
      "id": _id,
      title
    },
    media->{
      "type": _type,
      "id": _id,
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
    }
 }
}`;
