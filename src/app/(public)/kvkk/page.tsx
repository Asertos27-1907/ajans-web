import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "KVKK",
  description: "+Akademi Kişisel Verilerin Korunması Aydınlatma Metni.",
  path: "/kvkk",
});

export default function KvkkPage() {
  return (
    <article className="section-pad">
      <div className="container-site prose-site max-w-3xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          KVKK Aydınlatma Metni
        </h1>
        <p className="mt-6">
          +Akademi Oyunculuk & Menajerlik (“+Akademi”) olarak, 6698 sayılı
          Kişisel Verilerin Korunması Kanunu kapsamında başvuru ve iletişim
          süreçlerinde elde edilen kişisel verilerinizi hukuka uygun, şeffaf ve
          ölçülü biçimde işleriz.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-ink">İşlenen veriler</h2>
        <p className="mt-3">
          Kimlik, iletişim, fiziksel özellik, kariyer ve medya verileriniz;
          başvuru değerlendirme, casting eşleştirme ve iletişim amaçlarıyla
          işlenebilir.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-ink">Haklarınız</h2>
        <p className="mt-3">
          Kişisel verilerinize ilişkin bilgilendirme, düzeltme, silme ve itiraz
          haklarınızı ilgili mevzuat çerçevesinde kullanabilirsiniz. Bu sayfa
          bilgilendirme amaçlıdır; resmi süreçler için yazılı talep iletilmesi
          gerekir.
        </p>
      </div>
    </article>
  );
}
