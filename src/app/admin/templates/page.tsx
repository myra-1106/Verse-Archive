import { db } from "@/lib/db";
import { requireUser } from "@/server/current-user";
import { copyTemplate, deleteTemplate, moveTemplate, saveTemplate } from "@/server/template-actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { ensureDefaultEnvironments } from "@/server/environments";

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string; copied?: string; deleted?: string; moved?: string }> }) {
  const user = await requireUser();
  if (!user.author) return <p>请先绑定作者资料后再使用模板。</p>;
  await ensureDefaultEnvironments();
  const query = await searchParams;
  const [templates, environments] = await Promise.all([
    db.authorTemplate.findMany({ where: { authorId: user.author.id }, include: { environments: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }),
    db.environment.findMany({ where: { enabled: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }),
  ]);
  const editing = templates.find(({ id }) => id === query.edit);
  return <div className="max-w-4xl">
    <h1 className="text-3xl font-semibold">模板管理</h1>
    {query.saved || query.copied || query.deleted || query.moved ? <p className="mt-3 text-sm text-green-600">{query.saved ? "模板已保存" : query.copied ? "模板已复制" : query.deleted ? "模板已删除" : "顺序已更新"}</p> : null}
    <form action={saveTemplate} className="mt-7 space-y-4 rounded-3xl border border-border bg-surface p-5">
      {editing ? <input name="templateId" type="hidden" value={editing.id} /> : null}
      <Field label="模板名称" name="name" value={editing?.name} />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="直购价（元）" name="directPriceYuan" value={editing ? String(editing.directPriceCents / 100) : ""} /><Field label="转发价（元）" name="repostPriceYuan" value={editing ? String(editing.repostPriceCents / 100) : ""} /></div>
      <fieldset><legend className="text-sm font-medium">适配环境</legend><div className="mt-2 flex flex-wrap gap-4">{environments.map((environment) => <label className="text-sm" key={environment.id}><input className="mr-2" defaultChecked={editing?.environments.some((item) => item.environmentId === environment.id)} name="environmentIds" type="checkbox" value={environment.id} />{environment.name}</label>)}</div></fieldset>
      <Area label="功能说明" name="features" value={editing?.features} /><Area label="使用要求" name="usageRequirements" value={editing?.usageRequirements} /><Area label="获取方式" name="acquisitionMethod" value={editing?.acquisitionMethod} /><Area label="转发要求" name="repostRequirements" value={editing?.repostRequirements} /><Area label="购买须知" name="purchaseNotes" value={editing?.purchaseNotes} /><Area label="联系方式" name="contactDetails" value={editing?.contactDetails} /><Area label="其他固定说明" name="otherNotes" value={editing?.otherNotes} />
      <SubmitButton>{editing ? "保存修改" : "新增模板"}</SubmitButton>
    </form>
    <div className="mt-7 space-y-3">{templates.map((template, index) => <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-4" key={template.id}><strong className="min-w-0 flex-1">{template.name}</strong><a href={`/admin/templates?edit=${template.id}`}>编辑</a><form action={copyTemplate}><input name="templateId" type="hidden" value={template.id}/><button>复制</button></form><form action={moveTemplate}><input name="templateId" type="hidden" value={template.id}/><button disabled={index === 0} name="direction" value="up">↑</button></form><form action={moveTemplate}><input name="templateId" type="hidden" value={template.id}/><button disabled={index === templates.length - 1} name="direction" value="down">↓</button></form><form action={deleteTemplate}><input name="templateId" type="hidden" value={template.id}/><button className="text-red-600">删除</button></form></div>)}</div>
  </div>;
}

function Field({ label, name, value = "" }: { label: string; name: string; value?: string }) { return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" defaultValue={value} name={name} required /></label>; }
function Area({ label, name, value = "" }: { label: string; name: string; value?: string }) { return <label className="block text-sm font-medium">{label}<textarea className="field-input mt-2 min-h-20 py-3" defaultValue={value} name={name} /></label>; }
