import { cookies } from "next/headers";
import { db, type HouseholdRow, type MemberRow } from "./db";

const COOKIE_NAME = "bucket_session";
const MAX_AGE = 60 * 60 * 24 * 365; // one year

export type Session = {
  householdId: string;
  memberId: string;
};

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.householdId || !parsed.memberId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionContext(): Promise<
  | { session: Session; household: HouseholdRow; member: MemberRow }
  | null
> {
  const session = await getSession();
  if (!session) return null;
  const household = db()
    .prepare("SELECT * FROM households WHERE id = ?")
    .get(session.householdId) as HouseholdRow | undefined;
  if (!household) return null;
  const member = db()
    .prepare("SELECT * FROM members WHERE id = ? AND household_id = ?")
    .get(session.memberId, household.id) as MemberRow | undefined;
  if (!member) return null;
  return { session, household, member };
}
