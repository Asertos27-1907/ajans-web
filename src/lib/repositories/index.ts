import {
  mockActors,
  mockAdmins,
  mockApplications,
  mockContactMessages,
  mockReferences,
  mockSiteSettings,
} from "@/data/mock";
import { paginate, slugify } from "@/lib/utils";
import type {
  Actor,
  ActorFilters,
  AdminUser,
  Application,
  ApplicationFilters,
  ApplicationStatus,
  ContactMessage,
  PaginatedResult,
  ReferenceProject,
  SiteSettings,
} from "@/types";

/** In-memory stores — later swap with Supabase repositories */
let applications = [...mockApplications];
let actors = [...mockActors];
let references = [...mockReferences];
let contactMessages = [...mockContactMessages];
let siteSettings: SiteSettings = structuredClone(mockSiteSettings);
let admins = [...mockAdmins];

function delay(ms = 80) {
  return new Promise((r) => setTimeout(r, ms));
}

export const applicationRepository = {
  async list(filters: ApplicationFilters = {}): Promise<PaginatedResult<Application>> {
    await delay();
    let items = [...applications];
    const {
      search,
      city,
      gender,
      status,
      hairColor,
      eyeColor,
      ageMin,
      ageMax,
      heightMin,
      heightMax,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 20,
    } = filters;

    if (search) {
      const q = search.toLocaleLowerCase("tr-TR");
      items = items.filter(
        (a) =>
          a.firstName.toLocaleLowerCase("tr-TR").includes(q) ||
          a.lastName.toLocaleLowerCase("tr-TR").includes(q) ||
          a.phone.includes(q),
      );
    }
    if (city) items = items.filter((a) => a.city === city);
    if (gender) items = items.filter((a) => a.gender === gender);
    if (status) items = items.filter((a) => a.status === status);
    if (hairColor) items = items.filter((a) => a.hairColor === hairColor);
    if (eyeColor) items = items.filter((a) => a.eyeColor === eyeColor);
    if (ageMin != null) items = items.filter((a) => a.age >= ageMin);
    if (ageMax != null) items = items.filter((a) => a.age <= ageMax);
    if (heightMin != null) items = items.filter((a) => a.heightCm >= heightMin);
    if (heightMax != null) items = items.filter((a) => a.heightCm <= heightMax);
    if (dateFrom) items = items.filter((a) => a.createdAt >= dateFrom);
    if (dateTo) items = items.filter((a) => a.createdAt <= dateTo);

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginate(items, page, pageSize);
  },

  async getById(id: string) {
    await delay();
    return applications.find((a) => a.id === id) ?? null;
  },

  async create(input: Omit<Application, "id" | "createdAt" | "updatedAt">) {
    await delay();
    const item: Application = {
      ...input,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    applications = [item, ...applications];
    return item;
  },

  async update(id: string, patch: Partial<Application>) {
    await delay();
    applications = applications.map((a) =>
      a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
    );
    return applications.find((a) => a.id === id) ?? null;
  },

  async updateStatus(id: string, status: ApplicationStatus) {
    return this.update(id, { status });
  },

  async remove(id: string) {
    await delay();
    applications = applications.filter((a) => a.id !== id);
  },

  async getAllRaw() {
    await delay();
    return [...applications];
  },

  async stats() {
    await delay();
    return {
      total: applications.length,
      yeni: applications.filter((a) => a.status === "yeni").length,
      inceleniyor: applications.filter((a) => a.status === "inceleniyor").length,
    };
  },
};

export const actorRepository = {
  async list(filters: ActorFilters = {}): Promise<PaginatedResult<Actor>> {
    await delay();
    let items = [...actors];
    const {
      search,
      city,
      gender,
      showOnWebsite,
      isFeatured,
      isActive,
      page = 1,
      pageSize = 24,
    } = filters;

    if (search) {
      const q = search.toLocaleLowerCase("tr-TR");
      items = items.filter(
        (a) =>
          a.firstName.toLocaleLowerCase("tr-TR").includes(q) ||
          a.lastName.toLocaleLowerCase("tr-TR").includes(q),
      );
    }
    if (city) items = items.filter((a) => a.city === city);
    if (gender) items = items.filter((a) => a.gender === gender);
    if (showOnWebsite != null)
      items = items.filter((a) => a.showOnWebsite === showOnWebsite);
    if (isFeatured != null) items = items.filter((a) => a.isFeatured === isFeatured);
    if (isActive != null) items = items.filter((a) => a.isActive === isActive);

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginate(items, page, pageSize);
  },

  async listPublic(page = 1, pageSize = 24) {
    return this.list({ showOnWebsite: true, isActive: true, page, pageSize });
  },

  async getFeatured(limit = 6) {
    await delay();
    return actors
      .filter((a) => a.showOnWebsite && a.isActive && a.isFeatured)
      .slice(0, limit);
  },

  async getBySlug(slug: string) {
    await delay();
    return (
      actors.find((a) => a.slug === slug && a.showOnWebsite && a.isActive) ?? null
    );
  },

  async getById(id: string) {
    await delay();
    return actors.find((a) => a.id === id) ?? null;
  },

  async create(input: Omit<Actor, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string }) {
    await delay();
    const item: Actor = {
      ...input,
      id: `actor-${Date.now()}`,
      slug: input.slug || slugify(`${input.firstName}-${input.lastName}`),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    actors = [item, ...actors];
    return item;
  },

  async update(id: string, patch: Partial<Actor>) {
    await delay();
    actors = actors.map((a) =>
      a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
    );
    return actors.find((a) => a.id === id) ?? null;
  },

  async remove(id: string) {
    await delay();
    actors = actors.filter((a) => a.id !== id);
  },

  async fromApplication(app: Application) {
    const cover =
      app.photos.find((p) => p.type === "portre")?.url ??
      app.photos[0]?.url ??
      "/placeholders/actor-01.jpg";
    return this.create({
      firstName: app.firstName,
      lastName: app.lastName,
      birthDate: app.birthDate,
      age: app.age,
      city: app.city,
      gender: app.gender,
      heightCm: app.heightCm,
      weightKg: app.weightKg,
      hairColor: app.hairColor,
      eyeColor: app.eyeColor,
      bodySize: app.topSize,
      phone: app.phone,
      email: app.email,
      bio: app.bio,
      experiences: app.actingExperience,
      projects: app.projects,
      photos: app.photos.map((p, i) => ({
        id: `from-${app.id}-${i}`,
        actorId: "",
        url: p.url,
        thumbnailUrl: p.thumbnailUrl,
        alt: p.alt,
        isCover: i === 0,
        sortOrder: i + 1,
      })),
      coverPhotoUrl: cover,
      isActive: true,
      showOnWebsite: false,
      isFeatured: false,
      applicationId: app.id,
    });
  },

  async getAllRaw() {
    await delay();
    return [...actors];
  },

  async stats() {
    await delay();
    return {
      active: actors.filter((a) => a.isActive).length,
    };
  },
};

export const referenceRepository = {
  async list(opts?: { activeOnly?: boolean; featuredOnly?: boolean }) {
    await delay();
    let items = [...references].sort((a, b) => a.sortOrder - b.sortOrder);
    if (opts?.activeOnly) items = items.filter((r) => r.isActive);
    if (opts?.featuredOnly) items = items.filter((r) => r.isFeatured);
    return items;
  },

  async getById(id: string) {
    await delay();
    return references.find((r) => r.id === id) ?? null;
  },

  async create(input: Omit<ReferenceProject, "id" | "createdAt">) {
    await delay();
    const item: ReferenceProject = {
      ...input,
      id: `ref-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    references = [...references, item];
    return item;
  },

  async update(id: string, patch: Partial<ReferenceProject>) {
    await delay();
    references = references.map((r) => (r.id === id ? { ...r, ...patch } : r));
    return references.find((r) => r.id === id) ?? null;
  },

  async remove(id: string) {
    await delay();
    references = references.filter((r) => r.id !== id);
  },

  async stats() {
    await delay();
    return { total: references.filter((r) => r.isActive).length };
  },
};

export const contactRepository = {
  async list() {
    await delay();
    return [...contactMessages].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  async create(input: Omit<ContactMessage, "id" | "createdAt" | "isRead">) {
    await delay();
    const item: ContactMessage = {
      ...input,
      id: `msg-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    contactMessages = [item, ...contactMessages];
    return item;
  },

  async markRead(id: string, isRead = true) {
    await delay();
    contactMessages = contactMessages.map((m) =>
      m.id === id ? { ...m, isRead } : m,
    );
  },

  async stats() {
    await delay();
    return {
      total: contactMessages.length,
      unread: contactMessages.filter((m) => !m.isRead).length,
    };
  },
};

export const settingsRepository = {
  async get() {
    await delay();
    return structuredClone(siteSettings);
  },
  async update(patch: Partial<SiteSettings>) {
    await delay();
    siteSettings = { ...siteSettings, ...patch };
    return structuredClone(siteSettings);
  },
};

export const adminRepository = {
  async list() {
    await delay();
    return [...admins];
  },
  async getById(id: string) {
    await delay();
    return admins.find((a) => a.id === id) ?? null;
  },
  async create(input: Omit<AdminUser, "id" | "createdAt">) {
    await delay();
    const item: AdminUser = {
      ...input,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    admins = [...admins, item];
    return item;
  },
  async update(id: string, patch: Partial<AdminUser>) {
    await delay();
    admins = admins.map((a) => (a.id === id ? { ...a, ...patch } : a));
    return admins.find((a) => a.id === id) ?? null;
  },
};
