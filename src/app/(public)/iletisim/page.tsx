import ContactFormSection from "@/components/forms/ContactForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "İletişim",
  description: "+Akademi iletişim bilgileri ve mesaj formu. İzmir Alsancak.",
  path: "/iletisim",
});

export default function ContactPage() {
  return (
    <section className="section-pad">
      <ContactFormSection />
    </section>
  );
}
