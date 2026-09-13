import type {
  Actor,
  AdminUser,
  Application,
  ContactMessage,
  ReferenceProject,
  SiteSettings,
} from "@/types";

const now = "2026-03-10T10:00:00.000Z";

function appPhotos(id: string, n: number): Application["photos"] {
  const img = `/assets/actor-${String(((n - 1) % 12) + 1).padStart(2, "0")}.jpg`;
  return [
    {
      id: `${id}-p1`,
      applicationId: id,
      url: img,
      thumbnailUrl: img,
      type: "portre",
      alt: "Portre",
    },
  ];
}

const cities = [
  "İzmir",
  "İstanbul",
  "Ankara",
  "Antalya",
  "Bursa",
  "Muğla",
  "Eskişehir",
];

const statuses: Application["status"][] = [
  "yeni",
  "inceleniyor",
  "gorusme",
  "kabul",
  "red",
  "arsiv",
  "yeni",
  "inceleniyor",
  "yeni",
  "gorusme",
  "kabul",
  "yeni",
  "inceleniyor",
  "red",
  "yeni",
  "gorusme",
  "kabul",
  "yeni",
  "inceleniyor",
  "arsiv",
];

const firstNames = [
  "Elif", "Can", "Zeynep", "Emre", "Ayşe", "Burak", "Deniz", "Mert", "Selin", "Kaan",
  "İrem", "Onur", "Melis", "Arda", "Ceren", "Baran", "Naz", "Tolga", "Ece", "Yiğit",
];
const lastNames = [
  "Yılmaz", "Demir", "Kaya", "Çelik", "Şahin", "Aydın", "Öztürk", "Arslan", "Doğan", "Kurt",
  "Koç", "Özdemir", "Aslan", "Polat", "Erdoğan", "Aksoy", "Güneş", "Yıldız", "Çetin", "Kara",
];

export const mockApplications: Application[] = Array.from({ length: 20 }).map((_, i) => {
  const id = `app-${String(i + 1).padStart(3, "0")}`;
  const age = 17 + ((i * 3) % 28);
  return {
    id,
    firstName: firstNames[i],
    lastName: lastNames[i],
    birthDate: `${2026 - age}-0${(i % 9) + 1}-15`,
    age,
    gender: i % 3 === 0 ? "erkek" : i % 3 === 1 ? "kadin" : "diger",
    city: cities[i % cities.length],
    phone: `0532${String(1000000 + i * 1111).slice(0, 7)}`,
    heightCm: 160 + (i % 25),
    weightKg: 52 + (i % 30),
    experience:
      i % 2 === 0
        ? "2 yıl amatör tiyatro, kısa film deneyimi"
        : i % 3 === 0
          ? "Reklam ve katalog çekimleri"
          : "",
    photos: appPhotos(id, i + 1),
    status: statuses[i],
    tags: i % 2 === 0 ? ["öncelikli"] : ["yeni-yetenek"],
    adminNotes: i % 4 === 0 ? "Portföy güçlü, görüşme planlanabilir." : "",
    isFavorite: i % 5 === 0,
    createdAt: `2026-0${(i % 3) + 1}-${String((i % 27) + 1).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: now,
  };
});

export const mockActors: Actor[] = Array.from({ length: 12 }).map((_, i) => {
  const id = `actor-${String(i + 1).padStart(3, "0")}`;
  const firstName = firstNames[i];
  const lastName = lastNames[i];
  const img = `/assets/actor-${String(i + 1).padStart(2, "0")}.jpg`;
  const age = 20 + ((i * 2) % 18);
  return {
    id,
    slug: `${firstName}-${lastName}`
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, "-"),
    firstName,
    lastName,
    birthDate: `${2026 - age}-05-12`,
    age,
    city: cities[i % cities.length],
    gender: i % 2 === 0 ? "kadin" : "erkek",
    phone: `0533${String(2000000 + i * 2222).slice(0, 7)}`,
    heightCm: 165 + (i % 20),
    weightKg: 55 + (i % 20),
    experience:
      "Oyunculuk atölyeleri, kısa filmler, sahne ve kamera önü çalışmaları",
    photos: [
      {
        id: `${id}-1`,
        actorId: id,
        url: img,
        thumbnailUrl: img,
        alt: `${firstName} ${lastName}`,
        isCover: true,
        sortOrder: 1,
      },
    ],
    coverPhotoUrl: img,
    isActive: i % 7 !== 0,
    showOnWebsite: i < 10,
    isFeatured: i < 6,
    applicationId: i < 3 ? `app-${String(i + 4).padStart(3, "0")}` : undefined,
    createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-10T12:00:00.000Z`,
    updatedAt: now,
  };
});

export const mockReferences: ReferenceProject[] = [
  {
    id: "ref-001",
    title: "Ege Rüzgarı",
    category: "dizi",
    year: 2025,
    description: "Aile dramı türünde dizi prodüksiyonu için casting desteği.",
    coverImageUrl: "/assets/ref-01.jpg",
    actorIds: ["actor-001", "actor-002"],
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    createdAt: now,
  },
  {
    id: "ref-002",
    title: "Kıyı Hikayesi",
    category: "sinema",
    year: 2024,
    description: "Bağımsız sinema filmi oyuncu seçimleri.",
    coverImageUrl: "/assets/ref-02.jpg",
    actorIds: ["actor-003"],
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    createdAt: now,
  },
  {
    id: "ref-003",
    title: "Marka Kampanyası",
    category: "reklam",
    year: 2025,
    description: "Ulusal reklam filmi casting ve menajerlik desteği.",
    coverImageUrl: "/assets/ref-03.jpg",
    actorIds: ["actor-004", "actor-005"],
    isFeatured: true,
    isActive: true,
    sortOrder: 3,
    createdAt: now,
  },
  {
    id: "ref-004",
    title: "Gece Melodisi",
    category: "klip",
    year: 2024,
    description: "Müzik videosu oyuncu ve model koordinasyonu.",
    coverImageUrl: "/assets/ref-04.jpg",
    actorIds: ["actor-006"],
    isFeatured: false,
    isActive: true,
    sortOrder: 4,
    createdAt: now,
  },
  {
    id: "ref-005",
    title: "Studio Sessions",
    category: "produksiyon",
    year: 2025,
    description: "Kurumsal tanıtım ve prodüksiyon çekimleri.",
    coverImageUrl: "/assets/ref-05.jpg",
    actorIds: ["actor-007", "actor-008"],
    isFeatured: false,
    isActive: true,
    sortOrder: 5,
    createdAt: now,
  },
  {
    id: "ref-006",
    title: "Yeni Yüzler",
    category: "diger",
    year: 2023,
    description: "Genç yetenek keşif ve portfolyo çalışması.",
    coverImageUrl: "/assets/ref-06.jpg",
    actorIds: ["actor-001", "actor-009"],
    isFeatured: false,
    isActive: true,
    sortOrder: 6,
    createdAt: now,
  },
];

export const mockContactMessages: ContactMessage[] = [
  {
    id: "msg-001",
    name: "Ayşe Kaya",
    email: "ayse@ornek.com",
    phone: "05321234567",
    subject: "Casting talebi",
    message: "Yeni dizi projesi için oyuncu önerisi istiyoruz.",
    isRead: false,
    createdAt: "2026-03-08T11:00:00.000Z",
  },
  {
    id: "msg-002",
    name: "Mehmet Demir",
    email: "mehmet@ornek.com",
    subject: "Eğitim atölyesi",
    message: "Oyunculuk eğitim atölyesi hakkında bilgi almak istiyorum.",
    isRead: true,
    createdAt: "2026-03-05T09:30:00.000Z",
  },
];

export const mockAdmins: AdminUser[] = [
  {
    id: "admin-001",
    name: "Sistem Yöneticisi",
    email: "admin@artiakademi.local",
    role: "SUPER_ADMIN",
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "admin-002",
    name: "İçerik Editörü",
    email: "editor@artiakademi.local",
    role: "EDITOR",
    isActive: true,
    createdAt: "2025-02-01T00:00:00.000Z",
  },
  {
    id: "admin-003",
    name: "Casting Sorumlusu",
    email: "casting@artiakademi.local",
    role: "CASTING_MANAGER",
    isActive: true,
    createdAt: "2025-03-01T00:00:00.000Z",
  },
  {
    id: "admin-004",
    name: "İzleyici",
    email: "viewer@artiakademi.local",
    role: "VIEWER",
    isActive: true,
    createdAt: "2025-04-01T00:00:00.000Z",
  },
];

export const mockSiteSettings: SiteSettings = {
  companyName: "+Akademi Oyunculuk & Menajerlik",
  agencyName: "+Akademi",
  logoUrl: "/brand/logo.jpeg",
  phone: undefined,
  whatsapp: undefined,
  email: undefined,
  addressLines: [
    "1471 Sokak No:9 İç Kapı No:12",
    "Alsancak Mahallesi",
    "Konak / İzmir",
  ],
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=1471+Sokak+No:9+Alsancak+Konak+%C4%B0zmir",
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=1471%20Sokak%20No%3A9%20Alsancak%20Mahallesi%20Konak%20%C4%B0zmir&hl=tr&z=16&output=embed",
  instagram: "https://www.instagram.com/artiakademioyunculukmenajerlik",
  facebook: "https://www.facebook.com/share/1LmC9CvhLf/",
  youtube: undefined,
  tiktok: undefined,
  linkedin: undefined,
  heroTitle: "Yeteneğini Doğru Hikâyeyle Buluştur.",
  heroDescription:
    "+Akademi; oyunculuk eğitimi, cast, menajerlik ve prodüksiyon alanlarında yetenekleri sektörün ihtiyaçlarıyla buluşturan profesyonel bir yapıdır. Her adayın güçlü yönünü keşfetmeye, geliştirmeye ve doğru projelerle buluşturmaya odaklanıyoruz.",
  heroImageUrl: "/images/hero/hero-main.jpg",
  ctaText: "Oyuncu Başvurusu",
  ctaLink: "/basvuru",
  slides: [
    {
      id: "slide-1",
      title: "Yeteneğini Doğru Hikâyeyle Buluştur.",
      description:
        "+Akademi; oyunculuk eğitimi, cast, menajerlik ve prodüksiyon alanlarında yetenekleri sektörün ihtiyaçlarıyla buluşturan profesyonel bir yapıdır. Her adayın güçlü yönünü keşfetmeye, geliştirmeye ve doğru projelerle buluşturmaya odaklanıyoruz.",
      imageUrl: "/images/hero/hero-main.jpg",
      buttonText: "Oyuncu Başvurusu",
      buttonLink: "/basvuru",
      isActive: true,
      sortOrder: 1,
    },
  ],
  servicesSectionTitle: "Hizmetlerimiz",
  services: [
    {
      id: "svc-1",
      title: "Oyunculuk Eğitim Atölyesi",
      description:
        "Alanında deneyimli eğitmenlerle kamera önü oyunculuğu, karakter çalışması ve sahne pratiğine odaklanan eğitim programları sunuyoruz. Adayların teknik becerilerini geliştirirken kamera karşısındaki özgüvenlerini de güçlendirmeyi hedefliyoruz.",
      icon: "GraduationCap",
      imageUrl: "/images/services/services-edu.jpg",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "svc-2",
      title: "Oyunculuk Ajansı",
      description:
        "Yeni yetenekleri keşfediyor, profesyonel portföylerini güçlendiriyor ve uygun dizi, sinema, reklam ve dijital projelerle buluşmalarına destek oluyoruz.",
      icon: "Drama",
      imageUrl: "/images/services/services-agency.jpg",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "svc-3",
      title: "Manken / Model Ajansı",
      description:
        "Reklam, katalog, klip ve tanıtım projeleri için farklı profillerde model ve yetenekleri profesyonel prodüksiyonlarla buluşturuyoruz.",
      icon: "Sparkles",
      imageUrl: "/images/services/services-model.jpg",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "svc-4",
      title: "Film / Dizi / Reklam Prodüksiyonu",
      description:
        "Fikir aşamasından çekim süreçlerine kadar prodüksiyon ekipleriyle koordineli çalışıyor, projelerin yaratıcı ve teknik ihtiyaçlarına çözüm üretiyoruz.",
      icon: "Film",
      imageUrl: "/images/services/services-prod.jpg",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: "svc-5",
      title: "Menajerlik",
      description:
        "Oyuncuların kariyer planlaması, proje değerlendirmesi ve profesyonel temsil süreçlerinde uzun vadeli ve sürdürülebilir bir yaklaşım benimsiyoruz.",
      icon: "Briefcase",
      imageUrl: "/images/services/services-management.jpg",
      sortOrder: 5,
      isActive: true,
    },
    {
      id: "svc-6",
      title: "Cast Hizmetleri",
      description:
        "Yapım şirketleri ve markaların ihtiyaç duyduğu oyuncu profillerini doğru, hızlı ve düzenli bir casting süreciyle projelerle buluşturuyoruz.",
      icon: "Clapperboard",
      imageUrl: "/images/services/services-cast.jpg",
      sortOrder: 6,
      isActive: true,
    },
  ],
  aboutTitle: "Yetenekten Kariyere Uzanan Profesyonel Bir Yolculuk",
  aboutVision: "",
  aboutParagraphs: [
    {
      id: "ap-1",
      text: "+Akademi, oyunculuk ve menajerlik alanında deneyimli ekiplerle çalışan, yeni yeteneklerin sektöre hazırlanmasını ve doğru projelerle buluşmasını hedefleyen profesyonel bir yapıdır.",
      sortOrder: 1,
    },
    {
      id: "ap-2",
      text: "Eğitimden casting süreçlerine, kariyer planlamasından prodüksiyon desteğine kadar her adımda adaylarımızın gelişimine odaklanıyoruz. Amacımız yalnızca oyuncu keşfetmek değil; yeteneği doğru şekilde geliştirmek ve sürdürülebilir bir kariyer yolculuğuna hazırlamaktır.",
      sortOrder: 2,
    },
  ],
  aboutFeatures: [
    {
      id: "af-1",
      title: "Profesyonel Eğitim",
      description:
        "Deneyimli eğitmenler ve uygulamalı çalışmalarla oyunculuk becerilerinin gelişimini destekliyoruz.",
      icon: "GraduationCap",
    },
    {
      id: "af-2",
      title: "Sektör Odaklı Yaklaşım",
      description:
        "Eğitim ve temsil süreçlerini güncel sektör ihtiyaçlarına göre şekillendiriyoruz.",
      icon: "Network",
    },
    {
      id: "af-3",
      title: "Kariyer Desteği",
      description:
        "Adayların yalnızca başvuru sürecine değil, uzun vadeli kariyer gelişimine odaklanıyoruz.",
      icon: "Briefcase",
    },
    {
      id: "af-4",
      title: "Güvenilir İletişim",
      description:
        "Süreçlerin her aşamasında açık, düzenli ve profesyonel iletişimi ön planda tutuyoruz.",
      icon: "MessageCircle",
    },
  ],
  aboutImageUrl: "/images/about/about-main.jpg",
  stats: [
    { id: "st-1", label: "Profesyonel Oyuncu", value: 120, suffix: "+", isActive: false, sortOrder: 1 },
    { id: "st-2", label: "Oyuncu Adayı", value: 850, suffix: "+", isActive: false, sortOrder: 2 },
    { id: "st-3", label: "Hizmet Verilen Şehir", value: 25, suffix: "+", isActive: false, sortOrder: 3 },
    { id: "st-4", label: "Tamamlanan Proje", value: 60, suffix: "+", isActive: false, sortOrder: 4 },
  ],
  footerText:
    "Oyunculuk eğitimi, cast, menajerlik ve prodüksiyon alanlarında yetenekleri doğru projelerle buluşturuyoruz.",
};
