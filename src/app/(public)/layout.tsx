import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { getMergedSiteSettings } from "@/lib/settings/service";
import { JsonLd } from "@/components/public/JsonLd";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getMergedSiteSettings();

  return (
    <>
      <JsonLd settings={settings} />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
