const GET_ENTRY_BY_REF = `
  query GetPageByRef($id: ID!) {
    entry:allDocument(where: { _id: { eq: $id } } ) {
      ... on Page {
        type: _type
        url {
          current
        }
      } 
      ... on Project {
        type: _type
        url {
          current
        } 
      }
      ... on FileAsset {
        type: _type
        default {
          asset {
            url
          }
        }
      }
      ... on ProjectsArchive {
        type: _type
        url {
          current
        }
      }
      ... on Homepage {
        type: _type
      }
  }
}
`;

async function resolveLink(refId) {
  const { data } = await useData({
    key: "entryByRef-3",
    query: GET_ENTRY_BY_REF,
    variables: {
      id: refId,
    },
  });

  return data;
}

export const sanityData = (raw, type) => {
  switch (type) {
    case "spot": {
      return {
        title: raw?.title,
        member: raw?.member?.title,
        datetime: new Date(raw?.datetime).toLocaleDateString("it-IT", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        media: raw?.media,
      };
    }

    case "section": {
      const types = new Map([
        ["textBlock", "text"],
        ["mediaBlock", "media"],
        ["contentBlock", "content"],
      ]);

      return {
        blocks: raw?.map((b) => ({ ...b, type: types.get(b.type) })),
      };
    }
    case "text": {
      return {
        text: sanityText(raw?.textRaw, "styles"),
      };
    }
    case "textNoStyle": {
      return {
        text: sanityText(raw?.textRaw),
      };
    }
    case "rawText": {
      return {
        text: sanityText(raw, "styles"),
      };
    }
    case "rawTextNoStyle": {
      return {
        text: sanityText(raw),
      };
    }
    case "media": {
      const types = new Map([
        ["imageAsset", "image"],
        ["videoAsset", "video"],
        ["embedBlock", "embed"],
      ]);

      return {
        items: raw?.media?.length ? raw.media.map((m) => ({ ...m, type: types.get(m.type) })) : [],
      };
    }
    case "image": {
      return {
        ...sanityImage(raw),
      };
    }
    case "video": {
      return {
        src: raw?.file?.asset?.url,
      };
    }
    case "embed": {
      return raw;
    }
    case "link": {
      return {
        url:
          raw?.internal?.type === "homepage"
            ? "/"
            : raw?.internal?.default?.asset?.url || raw?.external || raw?.internal?.url.current,
        text: raw?.text || raw?.internal?.title,
        type: raw?.internal?.type,
      };
    }
    case "thumb": {
      const types = new Map([
        ["imageAsset", "image"],
        ["videoAsset", "video"],
      ]);

      return {
        url: raw?.url?.current,
        title: raw?.title,
        medium: {
          ...raw?.thumbMedia,
          type: types.get(raw?.thumbMedia?.type),
        },
      };
    }
    case "content": {
      return {
        text: sanityData(raw?.text, "text"),
        media: sanityData(raw?.mediaBlock, "media"),
        link: sanityData(raw?.link, "link"),
      };
    }
  }
};

const sanityImage = (image) => ({
  srcs: {
    900:
      image?.image?.asset?.extension === "gif"
        ? `${image?.image?.asset?.url}?w=900&h=900&fit=max`
        : `${image?.image?.asset?.url}?w=900&h=900&fit=max&fm=webp`,
    1800:
      image?.image?.asset?.extension === "gif"
        ? `${image?.image?.asset?.url}?w=1800&h=1800&fit=max`
        : `${image?.image?.asset?.url}?w=1800&h=1800&fit=max&fm=webp`,
    3200:
      image?.image?.asset?.extension === "gif"
        ? `${image?.image?.asset?.url}?w=3200&h=3200&fit=max`
        : `${image?.image?.asset?.url}?w=3200&h=3200&fit=max&fm=webp`,
  },
  placeholder: `${image?.image?.asset?.url}?w=16&h=16&fit=max&fm=webp`,
  format: image?.image?.asset?.extension,
  url: image?.image?.asset?.url,
  width: image?.image?.asset?.metadata?.dimensions?.width,
  height: image?.image?.asset?.metadata?.dimensions?.height,
  ratio: image?.image?.ratio,
  alt: image?.image?.alt,
});
