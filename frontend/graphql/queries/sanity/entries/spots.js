import image from "@/graphql/queries/sanity/interfaces/image";
import video from "@/graphql/queries/sanity/interfaces/video";
import member from "@/graphql/queries/sanity/entries/member";

// Funzione per costruire la query dinamicamente in base alle variabili
export default (variables = {}) => {
  const hasDateFilters = variables.before || variables.after;
  const hasMemberFilter = variables.member;

  // Costruisci i filtri dinamicamente
  const filters = [];

  if (hasDateFilters) {
    const dateFilter = [];
    if (variables.after) dateFilter.push("gte: $after");
    if (variables.before) dateFilter.push("lte: $before");
    if (dateFilter.length > 0) {
      filters.push(`datetime: { ${dateFilter.join(", ")} }`);
    }
  }

  if (hasMemberFilter) {
    filters.push("member: { _id: { eq: $member } }");
  }

  // Crea la clausola where solo se ci sono filtri
  const whereClause = filters.length > 0 ? `, where: { ${filters.join(", ")} }` : "";

  // Definisci i parametri della query solo per le variabili effettivamente usate
  const params = [];
  if (variables.before) params.push("$before: DateTime");
  if (variables.after) params.push("$after: DateTime");
  if (variables.member) params.push("$member: ID");

  const queryParams = params.length > 0 ? `(${params.join(", ")})` : "";

  return /* GraphQL */ `
    ${image}
    ${video}
    ${member}
    query ${queryParams} {
      entries: allSpot(sort: { datetime: DESC } ${whereClause}) {
        title
        datetime
        member {
          ...Member
        }
        media {
          ...ImageInterface
          ...VideoInterface
        }
      }
    }
  `;
};
