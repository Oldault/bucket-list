import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { listItems } from "@/lib/actions";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/");

  const data = await listItems();
  if (!data) redirect("/");

  return (
    <AppShell
      household={{
        id: ctx.household.id,
        name: ctx.household.name,
        inviteCode: ctx.household.invite_code,
        homeLat: ctx.household.home_lat,
        homeLng: ctx.household.home_lng,
      }}
      me={{ id: ctx.member.id, name: ctx.member.name, color: ctx.member.color }}
      initialItems={data.items}
      members={data.members.map((m) => ({ id: m.id, name: m.name, color: m.color }))}
    />
  );
}
