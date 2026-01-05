// GROQ projection for video assets - no longer needed as a fragment
// This is now embedded in the main queries
export default `{
  "type": _type,
  "id": _id,
  title,
  "file": {
    "asset": file.asset->{
      url,
      "extension": extension
    }
  },
  description
}`;
