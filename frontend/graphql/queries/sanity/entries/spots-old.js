// GROQ query for spots
export default (variables = {}) => {
  const hasDateFilters = variables.before || variables.after;
  const hasMemberFilter = variables.member;
  const hasMediaFilter = variables.media !== undefined;

  // Build filters dynamically
  const filters = ['_type == "spot"'];

  if (hasDateFilters) {
    if (variables.after) {
      filters.push(`datetime >= $after`);
    }
    if (variables.before) {
      filters.push(`datetime <= $before`);
    }
  }

  if (hasMemberFilter) {
    filters.push("member._ref == $member");
  }

  if (hasMediaFilter) {
    // This is the key feature that wasn't available in GraphQL!
    if (variables.media === true) {
      filters.push("defined(media)");
    } else if (variables.media === false) {
      filters.push("!defined(media)");
    }
  }

  // Combine filters
  const filterClause = filters.join(" && ");

  // Build the query
  const query = `*[${filterClause}] | order(datetime desc) [${variables.offset || 0}...${(variables.offset || 0) + (variables.limit || 1000)}] {
    _id,
    title,
    datetime,
    "member": member->{
      _id,
      title
    },
    "media": media->{
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
    }
  }`;

  return query;
};
