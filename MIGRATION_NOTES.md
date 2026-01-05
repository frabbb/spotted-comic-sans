# GraphQL to GROQ Migration Notes

## Changes Made

### 1. Query Files Converted

- ✅ `frontend/graphql/queries/sanity/entries/spots.js` - Converted to GROQ
- ✅ `frontend/graphql/queries/sanity/singles/site.js` - Converted to GROQ
- ✅ `frontend/graphql/queries/sanity/entries/member.js` - Simplified (now embedded in queries)
- ✅ `frontend/graphql/queries/sanity/interfaces/image.js` - Simplified (now embedded in queries)
- ✅ `frontend/graphql/queries/sanity/interfaces/video.js` - Simplified (now embedded in queries)

### 2. API Endpoint Updated

- ✅ `frontend/server/api/data.post.js` - Now uses Sanity's HTTP API directly to execute GROQ queries instead of GraphQL
- Uses endpoint: `https://n6ou6qni.api.sanity.io/v2023-08-01/data/query/production`

### 3. Dependencies

- ✅ No new dependencies needed - using native `$fetch` for HTTP requests

### 4. Pages Updated

- ✅ `frontend/pages/index.vue` - Now filters spots with media directly in the query
- ✅ `frontend/pages/wrapped.vue` - Now filters spots with media directly in the query

### 5. Key Benefits of GROQ Migration

#### Media Filtering Now Works!

The main reason for this migration was that GraphQL couldn't filter on polymorphic reference fields. Now with GROQ:

```javascript
// You can filter by whether media exists
spotsQuery({ media: true }); // Only spots with media
spotsQuery({ media: false }); // Only spots without media

// You can still use other filters
spotsQuery({
  media: true,
  member: "member-id",
  after: "2024-01-01",
  before: "2024-12-31",
});
```

#### More Flexible Queries

GROQ gives you much more power:

- Filter on any field, including references
- Use `defined()` to check if fields exist
- More complex filtering logic
- Better performance for complex queries

### 6. Next Steps

No additional dependencies needed! The migration uses native HTTP fetch.

### 7. Environment Variables

The `NUXT_PUBLIC_SANITY_API` environment variable is no longer needed. The API endpoint now queries Sanity directly at:

- Endpoint: `https://n6ou6qni.api.sanity.io/v2023-08-01/data/query/production`
- Project ID: `n6ou6qni`
- Dataset: `production`
- API Version: `2023-08-01`

### 8. Unused Components

The following components reference queries that don't exist and have been commented out:

- `frontend/components/blocks/Archive.vue` - Not currently used
- `frontend/composables/useSingles.ts` - Partially commented out (only site query is active)

If you need these in the future, create the appropriate GROQ queries.

## Testing

After installing dependencies, test the following:

1. Homepage (`/`) - Should display spots with media
2. Wrapped page (`/wrapped`) - Should display spots with media
3. Filtering by date, member, and media should all work correctly

## Rollback (if needed)

If you need to rollback to GraphQL:

1. Revert changes to `frontend/server/api/data.post.js`
2. Restore the old GraphQL query files
3. Revert changes to pages
4. Update `NUXT_PUBLIC_SANITY_API` environment variable to GraphQL endpoint
