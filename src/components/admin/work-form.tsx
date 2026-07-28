"use client";

import type { AuthorCategory, Environment, Work } from "@prisma/client";
import { useState } from "react";
import { WechatNoteImporter } from "@/components/admin/wechat-note-importer";
import { SubmitButton } from "@/components/admin/submit-button";

type Template = {
  id: string; name: string; directPriceCents: number; repostPriceCents: number;
  features: string; usageRequirements: string; acquisitionMethod: string;
  repostRequirements: string; purchaseNotes: string; contactDetails: string; otherNotes: string;
  environments: { environmentId: string }[];
};
type Values = {
  directPriceYuan: string; repostPriceYuan: string; features: string; usageRequirements: string;
  acquisitionMethod: string; repostRequirements: string; purchaseNotes: string; contactDetails: string; otherNotes: string;
};

export function WorkForm({ action, work, categories, authorId, environments, selectedEnvironmentIds = [], templates = [] }: {
  action: (data: FormData) => void | Promise<void>; work?: Work; categories: AuthorCategory[]; authorId: string;
  environments: Environment[]; selectedEnvironmentIds?: string[]; templates?: Template[];
}) {
  const initial: Values = {
    directPriceYuan: work ? String(work.directPriceCents / 100) : "", repostPriceYuan: work ? String(work.repostPriceCents / 100) : "",
    features: work?.features ?? "", usageRequirements: work?.usageRequirements ?? "", acquisitionMethod: work?.acquisitionMethod ?? "",
    repostRequirements: work?.repostRequirements ?? "", purchaseNotes: work?.purchaseNotes ?? "", contactDetails: work?.contactDetails ?? "", otherNotes: work?.otherNotes ?? "",
  };
  const [values, setValues] = useState(initial);
  const [environmentIds, setEnvironmentIds] = useState(selectedEnvironmentIds);
  function applyTemplate(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setValues({
      directPriceYuan: String(template.directPriceCents / 100), repostPriceYuan: String(template.repostPriceCents / 100),
      features: template.features, usageRequirements: template.usageRequirements, acquisitionMethod: template.acquisitionMethod,
      repostRequirements: template.repostRequirements, purchaseNotes: template.purchaseNotes, contactDetails: template.contactDetails, otherNotes: template.otherNotes,
    });
    setEnvironmentIds(template.environments.map(({ environmentId }) => environmentId));
  }
  return <form action={action} className="mt-8 space-y-5">
    {!work ? <WechatNoteImporter onParsed={(result) => setValues((current) => ({ ...current, directPriceYuan: result.directPriceYuan || current.directPriceYuan, repostPriceYuan: result.repostPriceYuan || current.repostPriceYuan, features: result.features || current.features, repostRequirements: result.repostRequirements || current.repostRequirements, purchaseNotes: result.purchaseNotes || current.purchaseNotes }))} /> : null}
    {templates.length ? <label className="block text-sm font-medium">套用我的模板<select className="field-input mt-2" defaultValue="" onChange={(event) => applyTemplate(event.target.value)}><option value="">手动填写</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label> : null}
    <input name="authorId" type="hidden" value={authorId} />{work ? <><input name="workId" type="hidden" value={work.id} /><input name="slug" type="hidden" value={work.slug} /></> : null}
    <Input label="作品名称" name="name" defaultValue={work?.name} />
    <label className="block text-sm font-medium">作品分类<select className="field-input mt-2" defaultValue={work?.authorCategoryId ?? ""} name="authorCategoryId" required><option disabled value="">请选择分类</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
    <label className="flex items-center gap-2 text-sm"><input defaultChecked={work?.featured ?? false} name="featured" type="checkbox"/>在分类首页优先展示</label>
    <fieldset><legend className="text-sm font-medium">适配环境</legend><div className="mt-2 flex flex-wrap gap-5">{environments.map((environment) => <label className="text-sm" key={environment.id}><input checked={environmentIds.includes(environment.id)} className="mr-2" name="environmentIds" onChange={(event) => setEnvironmentIds((current) => event.target.checked ? [...current, environment.id] : current.filter((id) => id !== environment.id))} type="checkbox" value={environment.id}/>{environment.name}</label>)}</div><Input label="新增环境（可选）" name="newEnvironmentName" /></fieldset>
    <div className="grid gap-4 sm:grid-cols-2"><ControlledInput label="直购价（元）" name="directPriceYuan" values={values} setValues={setValues}/><ControlledInput label="转发价（元）" name="repostPriceYuan" values={values} setValues={setValues}/></div>
    <ControlledArea label="功能说明" name="features" values={values} setValues={setValues}/><ControlledArea label="使用要求" name="usageRequirements" values={values} setValues={setValues}/><ControlledArea label="获取方式" name="acquisitionMethod" values={values} setValues={setValues}/><ControlledArea label="转发要求" name="repostRequirements" values={values} setValues={setValues}/><ControlledArea label="购买须知" name="purchaseNotes" values={values} setValues={setValues}/><ControlledArea label="联系方式" name="contactDetails" values={values} setValues={setValues}/><ControlledArea label="其他说明" name="otherNotes" values={values} setValues={setValues}/>
    {!work ? <Input label="初始版本" name="version" defaultValue="1.0.0" /> : null}
    <SubmitButton pendingText="保存中…">{work ? "保存作品" : "保存并继续上传图片"}</SubmitButton>
  </form>;
}

function Input({ label, name, defaultValue = "" }: { label: string; name: string; defaultValue?: string }) { return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" defaultValue={defaultValue} name={name} /></label>; }
function ControlledInput({ label, name, values, setValues }: { label: string; name: keyof Values; values: Values; setValues: React.Dispatch<React.SetStateAction<Values>> }) { return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" name={name} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} required value={values[name]} /></label>; }
function ControlledArea({ label, name, values, setValues }: { label: string; name: keyof Values; values: Values; setValues: React.Dispatch<React.SetStateAction<Values>> }) { return <label className="block text-sm font-medium">{label}<textarea className="field-input mt-2 min-h-24 py-3" name={name} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} value={values[name]} /></label>; }
