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
  const img = `/placeholders/actor-${String(((n - 1) % 12) + 1).padStart(2, "0")}.jpg`;
  return [
    {
      id: `${id}-p1`,
      applicationId: id,
      url: img,
      thumbnailUrl: img,
      type: "portre",
      alt: "Portre",
    },
    {
      id: `${id}-p2`,
      applicationId: id,
      url: img,
      thumbnailUrl: img,
      type: "tam_boy",
      alt: "Tam boy",
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
const hair = ["Siyah", "Kahverengi", "Kumral", "Sarı", "Kızıl"];
const eyes = ["Kahverengi", "Ela", "Yeşil", "Mavi", "Siyah"];
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
  "Elif",
  "Can",
  "Zeynep",
  "Emre",
  "Ayşe",
  "Burak",
  "Deniz",
  "Mert",
  "Selin",
  "Kaan",
  "İrem",
  "Onur",
  "Melis",
  "Arda",
  "Ceren",
  "Baran",
  "Naz",
  "Tolga",
  "Ece",
  "Yiğit",
];
const lastNames = [
  "Yılmaz",
  "Demir",
  "Kaya",
  "Çelik",
  "Şahin",
  "Aydın",
  "Öztürk",
  "Arslan",
  "Doğan",
  "Kurt",
  "Koç",
  "Özdemir",
  "Aslan",
  "Polat",
  "Erdoğan",
  "Aksoy",
  "Güneş",
  "Yıldız",
  "Çetin",
  "Kara",
];

export const mockApplications: Application[] = Array.from({ length: 20 }).map(
  (_, i) => {
    const id = `app-${String(i + 1).padStart(3, "0")}`;
    const age = 17 + ((i * 3) % 28);
    const birthYear = 2026 - age;
    return {
      id,
      firstName: firstNames[i],
      lastName: lastNames[i],
      birthDate: `${birthYear}-0${(i % 9) + 1}-15`,
      age,
      gender: i % 3 === 0 ? "erkek" : i % 3 === 1 ? "kadin" : "diger",
      city: cities[i % cities.length],
      district: ["Alsancak", "Karşıyaka", "Bornova", "Kadıköy", "Çankaya"][i % 5],
      phone: `0532${String(1000000 + i * 1111).slice(0, 7)}`,
      whatsapp: `0532${String(1000000 + i * 1111).slice(0, 7)}`,
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@ornek.com`
        .replace(/ı/g, "i")
        .replace(/ş/g, "s")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c"),
      address: `${cities[i % cities.length]} örnek mahalle no:${i + 1}`,
      guardianName: age < 18 ? "Veli Örnek" : undefined,
      guardianPhone: age < 18 ? "05321112233" : undefined,
      heightCm: 160 + (i % 25),
      weightKg: 52 + (i % 30),
      hairColor: hair[i % hair.length],
      eyeColor: eyes[i % eyes.length],
      skinTone: ["Açık", "Orta", "Buğday", "Esmer"][i % 4],
      shoeSize: String(36 + (i % 10)),
      topSize: ["XS", "S", "M", "L", "XL"][i % 5],
      bottomSize: String(34 + (i % 8)),
      bust: String(80 + (i % 20)),
      waist: String(60 + (i % 20)),
      hips: String(85 + (i % 20)),
      actingExperience: i % 2 === 0 ? "2 yıl amatör tiyatro" : "Yok",
      actingEducation: i % 3 === 0 ? "Üniversite tiyatro kulübü" : "Atölye eğitimi",
      projects: i % 2 === 0 ? "Kısa film, reklam oyunu" : "",
      roles: i % 2 === 0 ? "Genç karakter, yan rol" : "",
      languages: "Türkçe, İngilizce",
      accents: "İzmir, İstanbul",
      sports: "Yüzme, koşu",
      dance: i % 2 === 0 ? "Modern dans" : "",
      instruments: i % 4 === 0 ? "Gitar" : "",
      specialSkills: "Doğaçlama, kamera önü",
      drivingLicense: i % 2 === 0 ? "B" : "Yok",
      occupation: ["Öğrenci", "Serbest", "Model", "Oyuncu adayı"][i % 4],
      bio: "Profesyonel kariyer hedefleyen yetenek adayı. Kamera önü ve sahne çalışmalarına açık.",
      showreelUrl: i % 3 === 0 ? "https://vimeo.com/example" : undefined,
      instagram: `@ornek_${firstNames[i].toLowerCase()}`,
      photos: appPhotos(id, i + 1),
      status: statuses[i],
      tags: i % 2 === 0 ? ["öncelikli", "izmir"] : ["yeni-yetenek"],
      adminNotes: i % 4 === 0 ? "Portföy güçlü, görüşme planlanabilir." : "",
      isFavorite: i % 5 === 0,
      createdAt: `2026-0${(i % 3) + 1}-${String((i % 27) + 1).padStart(2, "0")}T09:00:00.000Z`,
      updatedAt: now,
    };
  },
);

export const mockActors: Actor[] = Array.from({ length: 12 }).map((_, i) => {
  const id = `actor-${String(i + 1).padStart(3, "0")}`;
  const firstName = firstNames[i];
  const lastName = lastNames[i];
  const img = `/placeholders/actor-${String(i + 1).padStart(2, "0")}.jpg`;
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
    heightCm: 165 + (i % 20),
    weightKg: 55 + (i % 20),
    hairColor: hair[i % hair.length],
    eyeColor: eyes[i % eyes.length],
    bodySize: ["S", "M", "L"][i % 3],
    phone: `0533${String(2000000 + i * 2222).slice(0, 7)}`,
    email: `oyuncu${i + 1}@ornek.com`,
    bio: `${firstName}, kamera önü ve sahne deneyimine sahip profesyonel bir yetenektir. Dizi, reklam ve sinema projelerine açıktır.`,
    experiences: "Oyunculuk atölyeleri, kısa filmler, sahne çalışmaları",
    projects: "Reklam filmleri, bağımsız kısa filmler, tiyatro oyunları",
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
    isActive: true,
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
    coverImageUrl: "/placeholders/ref-01.jpg",
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
    coverImageUrl: "/placeholders/ref-02.jpg",
    actorIds: ["actor-003"],
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    createdAt: now,
  },
  {
    id: "ref-003",
    title: "Marka Kampanyası Yaz",
    category: "reklam",
    year: 2025,
    description: "Ulusal marka için reklam filmi cast süreci.",
    coverImageUrl: "/placeholders/ref-03.jpg",
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
    description: "Müzik klibi oyuncu ve model koordinasyonu.",
    coverImageUrl: "/placeholders/ref-04.jpg",
    actorIds: ["actor-006"],
    isFeatured: false,
    isActive: true,
    sortOrder: 4,
    createdAt: now,
  },
  {
    id: "ref-005",
    title: "Alsancak Günlükleri",
    category: "produksiyon",
    year: 2023,
    description: "Bölgesel içerik prodüksiyonu ve oyuncu yönetimi.",
    coverImageUrl: "/placeholders/ref-05.jpg",
    actorIds: ["actor-007", "actor-008"],
    isFeatured: true,
    isActive: true,
    sortOrder: 5,
    createdAt: now,
  },
  {
    id: "ref-006",
    title: "Kurumsal Lansman",
    category: "diger",
    year: 2025,
    description: "Etkinlik ve lansman için yetenek koordinasyonu.",
    coverImageUrl: "/placeholders/ref-06.jpg",
    actorIds: ["actor-009"],
    isFeatured: false,
    isActive: true,
    sortOrder: 6,
    createdAt: now,
  },
];

export const mockContactMessages: ContactMessage[] = [
  {
    id: "msg-001",
    name: "Ayhan Korkmaz",
    email: "ayhan@ornekajans.com",
    phone: "05321234567",
    subject: "Reklam filmi casting",
    message: "Yeni kampanyamız için 20-30 yaş arası oyuncu arıyoruz.",
    isRead: false,
    createdAt: "2026-03-08T11:00:00.000Z",
  },
  {
    id: "msg-002",
    name: "Selin Ak",
    email: "selin@ornek.com",
    subject: "Eğitim atölyesi",
    message: "Oyunculuk eğitim atölyesi hakkında bilgi almak istiyorum.",
    isRead: true,
    createdAt: "2026-03-07T09:30:00.000Z",
  },
  {
    id: "msg-003",
    name: "Prodüksiyon X",
    email: "cast@produksiyonx.com",
    phone: "05339876543",
    subject: "Dizi yan roller",
    message: "Yaklaşan dizi projesi için yan rol seçmeleri planlıyoruz.",
    isRead: false,
    createdAt: "2026-03-06T16:20:00.000Z",
  },
  {
    id: "msg-004",
    name: "Mert Yalçın",
    email: "mert@ornek.com",
    subject: "Menajerlik görüşmesi",
    message: "Portföyümü değerlendirmenizi rica ederim.",
    isRead: true,
    createdAt: "2026-03-05T14:10:00.000Z",
  },
  {
    id: "msg-005",
    name: "Marka Ajansı",
    email: "hello@markaajansi.com",
    subject: "Model & oyuncu",
    message: "Yaz çekimleri için model ve oyuncu talebimiz var.",
    isRead: false,
    createdAt: "2026-03-04T10:45:00.000Z",
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
      imageUrl: "/assets/photos/p02.jpg",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "svc-3",
      title: "Manken / Model Ajansı",
      description:
        "Reklam, katalog ve moda çekimleri için model & manken koordinasyonu.",
      icon: "Sparkles",
      imageUrl: "/assets/photos/p08.jpg",
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
      imageUrl: "/assets/photos/p12.jpg",
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
    {
      id: "st-1",
      label: "Profesyonel Oyuncu",
      value: 120,
      suffix: "+",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: "st-2",
      label: "Oyuncu Adayı",
      value: 850,
      suffix: "+",
      isActive: true,
      sortOrder: 2,
    },
    {
      id: "st-3",
      label: "Hizmet Verilen Şehir",
      value: 25,
      suffix: "+",
      isActive: true,
      sortOrder: 3,
    },
    {
      id: "st-4",
      label: "Tamamlanan Proje",
      value: 60,
      suffix: "+",
      isActive: true,
      sortOrder: 4,
    },
  ],
  footerText:
    "Profesyonel eğitim, geniş sektör ağı ve kariyer desteğiyle yetenekleri geleceğe hazırlıyoruz.",
};
