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
  heroTitle: "Yeteneğini Geleceğinle Buluştur.",
  heroDescription:
    "Oyunculuk, casting, menajerlik ve profesyonel eğitim alanında yeni yetenekleri sektörle buluşturan güçlü bir yapı.",
  heroImageUrl: "/assets/hero-cinema.jpg",
  ctaText: "Oyuncu Başvurusu",
  ctaLink: "/basvuru",
  slides: [
    {
      id: "slide-1",
      title: "Yeteneğini Geleceğinle Buluştur.",
      description:
        "Oyunculuk, casting, menajerlik ve profesyonel eğitim alanında yeni yetenekleri sektörle buluşturan güçlü bir yapı.",
      imageUrl: "/assets/hero-cinema.jpg",
      buttonText: "Oyuncu Başvurusu",
      buttonLink: "/basvuru",
      isActive: true,
      sortOrder: 1,
    },
  ],
  servicesSectionTitle: "Faaliyet alanlarımız",
  services: [
    {
      id: "svc-1",
      title: "Oyunculuk Eğitim Atölyesi",
      description:
        "Kamera önü, sahne ve karakter çalışmalarıyla profesyonel eğitim programları.",
      icon: "GraduationCap",
      imageUrl: "/assets/services-edu.jpg",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "svc-2",
      title: "Oyunculuk Ajansı",
      description:
        "Yeteneklerin doğru projelerle buluşması için ajans ve temsil süreçleri.",
      icon: "Drama",
      imageUrl: "/assets/legacy/legacy-03.jpg",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "svc-3",
      title: "Manken / Model Ajansı",
      description:
        "Reklam, katalog ve moda çekimleri için model & manken koordinasyonu.",
      icon: "Sparkles",
      imageUrl: "/assets/legacy/legacy-04.jpg",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "svc-4",
      title: "Film / Dizi / Reklam Prodüksiyonu",
      description:
        "Prodüksiyon ekipleriyle uyumlu casting ve yetenek yönetimi desteği.",
      icon: "Film",
      imageUrl: "/assets/services-prod.jpg",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: "svc-5",
      title: "Menajerlik",
      description:
        "Kariyer planlama, görüşme süreçleri ve uzun soluklu profesyonel temsil.",
      icon: "Briefcase",
      imageUrl: "/assets/legacy/legacy-06.jpg",
      sortOrder: 5,
      isActive: true,
    },
    {
      id: "svc-6",
      title: "Cast Hizmetleri",
      description:
        "Yapım şirketleri ve ajanslar için hızlı, düzenli ve güvenilir cast çözümleri.",
      icon: "Clapperboard",
      imageUrl: "/assets/services-cast.jpg",
      sortOrder: 6,
      isActive: true,
    },
  ],
  aboutTitle: "Hakkımızda",
  aboutVision:
    "Türkiye genelindeki yetenekleri yapım şirketleri, reklam ajansları ve prodüksiyon ekipleriyle güvenilir süreçlerle buluşturmak.",
  aboutParagraphs: [
    {
      id: "ap-1",
      text: "+Akademi; oyunculuk eğitimi, menajerlik, casting ve model ajansı hizmetlerini bir araya getiren profesyonel bir yapıdır.",
      sortOrder: 1,
    },
    {
      id: "ap-2",
      text: "Kurumsal yaklaşımımız; güvenilir süreçler, kariyer desteği ve doğru projeyle doğru yeteneği eşleştirme üzerine kuruludur.",
      sortOrder: 2,
    },
  ],
  aboutFeatures: [
    {
      id: "af-1",
      title: "Profesyonel Eğitim",
      description:
        "Sektör odaklı atölyelerle kamera önü ve sahne becerilerini geliştiriyoruz.",
      icon: "GraduationCap",
    },
    {
      id: "af-2",
      title: "Geniş Network",
      description:
        "Yapım şirketleri, reklam ajansları ve prodüksiyon ekipleriyle çalışan bir ağ.",
      icon: "Network",
    },
    {
      id: "af-3",
      title: "Kariyer Desteği",
      description:
        "Başvurudan projeye kadar adayın gelişimini ve yönlendirmesini destekliyoruz.",
      icon: "Briefcase",
    },
  ],
  aboutImageUrl: "/assets/about-editorial.jpg",
  stats: [
    { id: "st-1", label: "Profesyonel Oyuncu", value: 120, suffix: "+", isActive: true, sortOrder: 1 },
    { id: "st-2", label: "Oyuncu Adayı", value: 850, suffix: "+", isActive: true, sortOrder: 2 },
    { id: "st-3", label: "Hizmet Verilen Şehir", value: 25, suffix: "+", isActive: true, sortOrder: 3 },
    { id: "st-4", label: "Tamamlanan Proje", value: 60, suffix: "+", isActive: true, sortOrder: 4 },
  ],
  footerText:
    "Profesyonel eğitim, geniş sektör ağı ve kariyer desteğiyle yetenekleri geleceğe hazırlıyoruz.",
};
