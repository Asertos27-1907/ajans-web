import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { settingsRepository } from "@/lib/repositories";
import { JsonLd } from "@/components/public/JsonLd";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await settingsRepository.get();

  return (
    <>
      <JsonLd settings={settings} />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
