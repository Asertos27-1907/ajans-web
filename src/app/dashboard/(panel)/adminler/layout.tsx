import { requireOwner } from "@/lib/auth/session";

export default async function AdminsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwner();
  return children;
}
