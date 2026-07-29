export const OPTIONAL_WORK_FIELDS = [
  "features",
  "usageRequirements",
  "acquisitionMethod",
  "repostRequirements",
  "purchaseNotes",
  "contactDetails",
  "otherNotes",
] as const;

export type OptionalWorkField = (typeof OPTIONAL_WORK_FIELDS)[number];

export const OPTIONAL_WORK_FIELD_LABELS: Record<OptionalWorkField, string> = {
  features: "功能说明",
  usageRequirements: "使用要求",
  acquisitionMethod: "获取方式",
  repostRequirements: "转发要求",
  purchaseNotes: "购买须知",
  contactDetails: "联系方式",
  otherNotes: "其他说明",
};

export function normalizeHiddenWorkFields(value: unknown): OptionalWorkField[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(OPTIONAL_WORK_FIELDS);
  return [...new Set(value.filter((item): item is OptionalWorkField => typeof item === "string" && allowed.has(item)))];
}
