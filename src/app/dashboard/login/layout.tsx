import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Giriş",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function DashboardLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthProfile();

  if (auth?.profile.active) {
    redirect("/dashboard");
  }

  if (auth && !auth.profile.active) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return children;
}
