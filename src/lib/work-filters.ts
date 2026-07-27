export type WorkFilters = {
  q: string;
  author: string;
  category: string;
  environment: "" | "LAB" | "WCGlass";
  sort: "latest" | "updated";
};

type QueryValue = string | string[] | undefined;

const first = (value: QueryValue) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export function normalizeWorkFilters(query: Record<string, QueryValue>): WorkFilters {
  const environment = first(query.environment).toLowerCase();
  const sort = first(query.sort);
  return {
    q: first(query.q).trim().slice(0, 80),
    author: first(query.author),
    category: first(query.category),
    environment: environment === "lab" ? "LAB" : environment === "wcglass" ? "WCGlass" : "",
    sort: sort === "updated" ? "updated" : "latest",
  };
}
