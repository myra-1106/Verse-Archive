"use client";

import type { AuthorCategory, Environment, Work } from "@prisma/client";
import { useState, useTransition } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { FieldOrderEditor } from "@/components/admin/field-order-editor";
import { normalizeWorkFieldOrder, type WorkFieldKey } from "@/lib/work-field-order";
import { ProtectedForm } from "@/components/protected-form";
import {
  normalizeHiddenWorkFields,
  OPTIONAL_WORK_FIELDS,
  OPTIONAL_WORK_FIELD_LABELS,
  type OptionalWorkField,
} from "@/lib/author-work-fields";
import { setAuthorWorkFieldHidden } from "@/server/author-work-field-actions";

type Template = {
  id: string; name: string; directPriceCents: number; repostPriceCents: number;
  features: string; usageRequirements: string; acquisitionMethod: string;
  repostRequirements: string; purchaseNotes: string; contactDetails: string; otherNotes: string;
  environments: { environmentId: string }[];
  fieldOrder: unknown;
};
type Values = {
  directPriceYuan: string; repostPriceYuan: string; features: string; usageRequirements: string;
  acquisitionMethod: string; repostRequirements: string; purchaseNotes: string; contactDetails: string; otherNotes: string;
};

export function WorkForm({ action, work, categories, authorId, environments, selectedEnvironmentIds = [], templates = [], hiddenWorkFields = [] }: {
  action: (data: FormData) => void | Promise<void>; work?: Work; categories: AuthorCategory[]; authorId: string;
  environments: Environment[]; selectedEnvironmentIds?: string[]; templates?: Template[]; hiddenWorkFields?: unknown;
}) {
  const initial: Values = {
    directPriceYuan: work?.directPriceCents ? String(work.directPriceCents / 100) : "", repostPriceYuan: work?.repostPriceCents ? String(work.repostPriceCents / 100) : "",
    features: work?.features ?? "", usageRequirements: work?.usageRequirements ?? "", acquisitionMethod: work?.acquisitionMethod ?? "",
    repostRequirements: work?.repostRequirements ?? "", purchaseNotes: work?.purchaseNotes ?? "", contactDetails: work?.contactDetails ?? "", otherNotes: work?.otherNotes ?? "",
  };
  const [values, setValues] = useState(initial);
  const [environmentIds, setEnvironmentIds] = useState(selectedEnvironmentIds);
  const [fieldOrder, setFieldOrder] = useState<WorkFieldKey[]>(() => normalizeWorkFieldOrder(work?.fieldOrder));
  const [hiddenFields, setHiddenFields] = useState<OptionalWorkField[]>(() => normalizeHiddenWorkFields(hiddenWorkFields));
  const [fieldMessage, setFieldMessage] = useState("");
  const [isUpdatingFields, startFieldUpdate] = useTransition();
  function updateField(field: OptionalWorkField, hidden: boolean) {
    const previous = hiddenFields;
    setHiddenFields(hidden ? [...new Set([...previous, field])] : previous.filter((item) => item !== field));
    setFieldMessage("");
    startFieldUpdate(async () => {
      try {
        await setAuthorWorkFieldHidden(authorId, field, hidden);
        setFieldMessage(hidden ? `${OPTIONAL_WORK_FIELD_LABELS[field]}已移除` : `${OPTIONAL_WORK_FIELD_LABELS[field]}已添加`);
      } catch {
        setHiddenFields(previous);
        setFieldMessage("字段设置保存失败，请重试");
      }
    });
  }
  function applyTemplate(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setValues((current) => ({
      directPriceYuan: template.directPriceCents ? String(template.directPriceCents / 100) : current.directPriceYuan,
      repostPriceYuan: template.repostPriceCents ? String(template.repostPriceCents / 100) : current.repostPriceYuan,
      features: template.features || current.features,
      usageRequirements: template.usageRequirements || current.usageRequirements,
      acquisitionMethod: template.acquisitionMethod || current.acquisitionMethod,
      repostRequirements: template.repostRequirements || current.repostRequirements,
      purchaseNotes: template.purchaseNotes || current.purchaseNotes,
      contactDetails: template.contactDetails || current.contactDetails,
      otherNotes: template.otherNotes || current.otherNotes,
    }));
    const templateEnvironmentIds = template.environments.map(({ environmentId }) => environmentId);
    if (templateEnvironmentIds.length) setEnvironmentIds(templateEnvironmentIds);
    setFieldOrder(normalizeWorkFieldOrder(template.fieldOrder));
  }
  return <ProtectedForm action={action} className="mt-8 space-y-5">
    {templates.length ? <label className="block text-sm font-medium">套用我的模板<select className="field-input mt-2" defaultValue="" onChange={(event) => applyTemplate(event.target.value)}><option value="">手动填写</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label> : null}
    <input name="authorId" type="hidden" value={authorId} />{work ? <><input name="workId" type="hidden" value={work.id} /><input name="slug" type="hidden" value={work.slug} /></> : null}
    <Input label="作品名称" name="name" defaultValue={work?.name} required />
    <label className="block text-sm font-medium">作品分类<select className="field-input mt-2" defaultValue={work?.authorCategoryId ?? ""} name="authorCategoryId" required><option disabled value="">请选择分类</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
    <label className="flex items-center gap-2 text-sm"><input defaultChecked={work?.featured ?? false} name="featured" type="checkbox"/>在分类首页优先展示</label>
    <fieldset><legend className="text-sm font-medium">适配环境</legend><div className="mt-2 flex flex-wrap gap-5">{environments.map((environment) => <label className="text-sm" key={environment.id}><input checked={environmentIds.includes(environment.id)} className="mr-2" name="environmentIds" onChange={(event) => setEnvironmentIds((current) => event.target.checked ? [...current, environment.id] : current.filter((id) => id !== environment.id))} type="checkbox" value={environment.id}/>{environment.name}</label>)}</div><Input label="新增环境（可选）" name="newEnvironmentName" /></fieldset>
    <div className="grid gap-4 sm:grid-cols-2"><ControlledInput label="直购价（元）" name="directPriceYuan" values={values} setValues={setValues}/><ControlledInput label="转发价（元）" name="repostPriceYuan" values={values} setValues={setValues}/></div>
    {OPTIONAL_WORK_FIELDS.filter((field) => !hiddenFields.includes(field)).map((field) =>
      <OptionalArea disabled={isUpdatingFields} field={field} key={field} onRemove={() => updateField(field, true)} setValues={setValues} values={values} />
    )}
    {hiddenFields.length ? <section className="rounded-2xl border border-dashed border-border p-4">
      <p className="text-sm font-medium">添加字段</p>
      <div className="mt-3 flex flex-wrap gap-2">{hiddenFields.map((field) => <button className="rounded-full border border-border px-3 py-2 text-sm" disabled={isUpdatingFields} key={field} onClick={() => updateField(field, false)} type="button">＋ {OPTIONAL_WORK_FIELD_LABELS[field]}</button>)}</div>
    </section> : null}
    {fieldMessage ? <p aria-live="polite" className="text-sm text-muted">{fieldMessage}</p> : null}
    <FieldOrderEditor hiddenFields={hiddenFields} order={fieldOrder} onChange={setFieldOrder} />
    {!work ? <Input label="初始版本" name="version" defaultValue="1.0.0" /> : null}
    <SubmitButton pendingText="保存中…">{work ? "保存作品" : "保存并继续上传图片"}</SubmitButton>
  </ProtectedForm>;
}

function Input({ label, name, defaultValue = "", required = false }: { label: string; name: string; defaultValue?: string; required?: boolean }) { return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" defaultValue={defaultValue} name={name} required={required} /></label>; }
function ControlledInput({ label, name, values, setValues }: { label: string; name: keyof Values; values: Values; setValues: React.Dispatch<React.SetStateAction<Values>> }) { return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" inputMode="decimal" name={name} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} pattern="\d{1,7}(?:\.\d{1,2})?" value={values[name]} /></label>; }

function OptionalArea({ disabled, field, onRemove, values, setValues }: {
  disabled: boolean; field: OptionalWorkField; onRemove: () => void; values: Values;
  setValues: React.Dispatch<React.SetStateAction<Values>>;
}) {
  return <div><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{OPTIONAL_WORK_FIELD_LABELS[field]}</span><button className="text-xs text-red-600" disabled={disabled} onClick={onRemove} type="button">移除</button></div><textarea className="field-input mt-2 min-h-24 py-3" name={field} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} value={values[field]} /></div>;
}
