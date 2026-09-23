import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { GoogleAdsTag } from "@/components/public/GoogleAdsTag";
import { MetaPixelTag } from "@/components/public/MetaPixelTag";
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
      <GoogleAdsTag />
      <MetaPixelTag />
      <JsonLd settings={settings} />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
