export type ParsedWechatNote = {
  name: string;
  directPriceYuan: string;
  repostPriceYuan: string;
  supportsLab: boolean;
  supportsWcglass: boolean;
  features: string;
  repostRequirements: string;
  purchaseNotes: string;
};

const labels = ["作品名称", "作品名", "名称", "支持环境", "环境", "直购价", "直购", "买断价", "转发价", "转发", "功能说明", "功能", "转发要求", "转发条件", "购买须知", "购买说明"];

function field(text: string, names: string[]) {
  const label = names.map(escapeRegExp).join("|");
  const next = labels.map(escapeRegExp).join("|");
  const match = text.match(new RegExp(`(?:^|\\n)\\s*(?:${label})\\s*[：:]\\s*([\\s\\S]*?)(?=\\n\\s*(?:${next})\\s*[：:]|$)`, "i"));
  return match?.[1].trim() ?? "";
}

function price(value: string) {
  return value.match(/\d+(?:\.\d{1,2})?/)?.[0] ?? "";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseWechatNote(rawText: string): ParsedWechatNote {
  const text = rawText.replace(/\r\n?/g, "\n").trim();
  const environment = field(text, ["支持环境", "环境"]);
  return {
    name: field(text, ["作品名称", "作品名", "名称"]).split("\n")[0]?.trim() ?? "",
    directPriceYuan: price(field(text, ["直购价", "直购", "买断价"])),
    repostPriceYuan: price(field(text, ["转发价", "转发"])),
    supportsLab: environment ? /\bLAB\b/i.test(environment) : true,
    supportsWcglass: environment ? /WCGlass/i.test(environment) : true,
    features: field(text, ["功能说明", "功能"]),
    repostRequirements: field(text, ["转发要求", "转发条件"]),
    purchaseNotes: field(text, ["购买须知", "购买说明"]),
  };
}
