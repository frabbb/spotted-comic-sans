import { createClient } from "@sanity/client";

export default defineEventHandler(async (event) => {
  const { editToken } = useRuntimeConfig();
  const body = await readBody(event);

  // Validate required fields
  if (!body.id) {
    throw createError({
      statusCode: 400,
      message: "Missing required field: id",
    });
  }

  if (!body.action || !["patch", "delete"].includes(body.action)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid or missing action. Must be "patch" or "delete"',
    });
  }

  // Create Sanity client
  const client = createClient({
    projectId: "n6ou6qni",
    dataset: "production",
    useCdn: false,
    token: editToken,
    apiVersion: "2024-01-01",
  });

  try {
    let result;

    if (body.action === "delete") {
      // Delete the document
      result = await client.delete(body.id);

      return {
        success: true,
        action: "delete",
        id: body.id,
        result,
      };
    }

    if (body.action === "patch") {
      // Validate patches are provided
      if (!body.patches || typeof body.patches !== "object") {
        throw createError({
          statusCode: 400,
          message: "Missing or invalid patches object",
        });
      }

      // Patch the document
      result = await client.patch(body.id).set(body.patches).commit();

      return {
        success: true,
        action: "patch",
        id: body.id,
        patches: body.patches,
        result,
      };
    }
  } catch (error) {
    console.error("Sanity operation failed:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to perform operation on Sanity",
    });
  }
});
