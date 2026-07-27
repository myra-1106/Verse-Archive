import { describe, expect, it } from "vitest";
import { parseWechatNote } from "@/lib/parse-wechat-note";

describe("WeChat note parser", () => {
  it("recognizes labeled work fields and environments", () => {
    expect(parseWechatNote(`
作品名称：月光播放器
支持环境：LAB、WCGlass
直购价：38元
转发价：28
功能说明：
支持歌词与进度显示
转发要求：转发作品介绍
购买须知：请先确认插件为最新版
    `)).toEqual({
      name: "月光播放器",
      directPriceYuan: "38",
      repostPriceYuan: "28",
      supportsLab: true,
      supportsWcglass: true,
      features: "支持歌词与进度显示",
      repostRequirements: "转发作品介绍",
      purchaseNotes: "请先确认插件为最新版",
    });
  });

  it("leaves missing fields empty for manual completion", () => {
    expect(parseWechatNote("作品名称：雾色主题")).toMatchObject({
      name: "雾色主题",
      directPriceYuan: "",
      repostPriceYuan: "",
      features: "",
    });
  });
});
