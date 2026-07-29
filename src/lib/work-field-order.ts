export const DEFAULT_WORK_FIELD_ORDER = [
  "identity",
  "environments",
  "directPrice",
  "repostPrice",
  "features",
  "usageRequirements",
  "acquisitionMethod",
  "repostRequirements",
  "purchaseNotes",
  "contactDetails",
  "otherNotes",
  "version",
  "previews",
] as const;

export type WorkFieldKey = (typeof DEFAULT_WORK_FIELD_ORDER)[number];

export const WORK_FIELD_LABELS: Record<WorkFieldKey, string> = {
  identity: "作者与作品名称",
  environments: "适配环境",
  directPrice: "直购价",
  repostPrice: "转发价",
  features: "功能说明",
  usageRequirements: "使用要求",
  acquisitionMethod: "获取方式",
  repostRequirements: "转发要求",
  purchaseNotes: "购买须知",
  contactDetails: "联系方式",
  otherNotes: "其他说明",
  version: "版本与更新时间",
  previews: "预览图区域",
};

export function normalizeWorkFieldOrder(value: unknown): WorkFieldKey[] {
  const allowed = new Set<string>(DEFAULT_WORK_FIELD_ORDER);
  const input = Array.isArray(value) ? value : [];
  const result = [...new Set(input.filter((item): item is WorkFieldKey => typeof item === "string" && allowed.has(item)))];
  for (const field of DEFAULT_WORK_FIELD_ORDER) {
    if (!result.includes(field)) result.push(field);
  }
  return result;
}
