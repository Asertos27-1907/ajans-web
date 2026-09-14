import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Gizlilik",
  description: "+Akademi gizlilik politikası.",
  path: "/gizlilik",
});

export default function PrivacyPage() {
  return (
    <article className="section-pad">
      <div className="container-site prose-site max-w-3xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          Gizlilik Politikası
        </h1>
        <p className="mt-6">
          Bu gizlilik politikası, +Akademi web sitesini ziyaret eden ve form
          dolduran kullanıcıların verilerinin nasıl korunduğunu açıklar.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-ink">Toplanan bilgiler</h2>
        <p className="mt-3">
          Başvuru formu, iletişim formu ve site kullanımına bağlı teknik
          veriler toplanabilir. Bilinmeyen iletişim kanalları için sahte telefon
          veya e-posta bilgisi yayınlanmaz.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-ink">Kullanım</h2>
        <p className="mt-3">
          Veriler yalnızca hizmet sunumu, başvuru değerlendirme ve yasal
          yükümlülükler kapsamında kullanılır; üçüncü taraflarla paylaşım
          casting süreçlerinin gerektirdiği ölçüde ve kontrollü yapılır.
        </p>
      </div>
    </article>
  );
}
