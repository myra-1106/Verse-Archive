import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { WorkCard } from "@/components/work-card";
import { getPublicWork } from "@/server/public-queries";

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPublicWork(id);
  if (!result) notFound();
  return <><SiteHeader/><main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8"><WorkCard {...result}/></main><MobileNav/></>;
}
