import { z } from "zod";

export const APPLICATION_GENDERS = [
  "kadin",
  "erkek",
  "diger",
  "belirtmek_istemiyor",
] as const;

export const APPLICATION_STATUSES = [
  "new",
  "reviewing",
  "interview",
  "accepted",
  "rejected",
  "archived",
] as const;

export const ALLOWED_PHOTO_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MIN_PHOTOS = 0;
export const MAX_PHOTOS = 5;
export const SIGNED_URL_TTL_SECONDS = 3600;
export const APPLICATION_PHOTOS_BUCKET = "application-photos";

/** Normalize TR mobile numbers to +90XXXXXXXXXX */
export function normalizeTrPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let national = "";

  if (digits.startsWith("90") && digits.length === 12) {
    national = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    return null;
  }

  if (!/^5\d{9}$/.test(national)) return null;
  return `+90${national}`;
}

const optionalText = (max: number, label: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((value) => (value ?? "").trim())
    .pipe(z.string().max(max, `${label} en fazla ${max} karakter olabilir`));

const heightCmField = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((value, ctx) => {
    if (value == null || value === "") return undefined;
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) {
      ctx.addIssue({ code: "custom", message: "Boy sayı olmalı" });
      return z.NEVER;
    }
    if (num < 0) {
      ctx.addIssue({ code: "custom", message: "Boy negatif olamaz" });
      return z.NEVER;
    }
    if (num > 0 && (num < 80 || num > 250)) {
      ctx.addIssue({ code: "custom", message: "Boy 80–250 cm arasında olmalı" });
      return z.NEVER;
    }
    return Math.round(num);
  });

const weightKgField = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((value, ctx) => {
    if (value == null || value === "") return undefined;
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) {
      ctx.addIssue({ code: "custom", message: "Kilo sayı olmalı" });
      return z.NEVER;
    }
    if (num < 0) {
      ctx.addIssue({ code: "custom", message: "Kilo negatif olamaz" });
      return z.NEVER;
    }
    if (num > 0 && (num < 20 || num > 350)) {
      ctx.addIssue({ code: "custom", message: "Kilo 20–350 kg arasında olmalı" });
      return z.NEVER;
    }
    return Math.round(num);
  });

const ageField = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((value, ctx) => {
    if (value == null || value === "") return null;
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      ctx.addIssue({ code: "custom", message: "Yaş tam sayı olmalı" });
      return z.NEVER;
    }
    if (num < 0 || num > 120) {
      ctx.addIssue({ code: "custom", message: "Yaş 0–120 arasında olmalı" });
      return z.NEVER;
    }
    return num;
  });

const birthDateField = z
  .string()
  .trim()
  .min(1, "Doğum tarihi gerekli")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Geçerli bir doğum tarihi girin",
  })
  .refine((value) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  }, {
    message: "Doğum tarihi gelecekte olamaz",
  });

/** Public short application form — only core contact fields required. */
export const applicationFieldsSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  last_name: z
    .string()
    .trim()
    .min(2, "Soyad en az 2 karakter olmalı")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  phone: z
    .string()
    .trim()
    .min(1, "Telefon gerekli")
    .transform((value, ctx) => {
      const normalized = normalizeTrPhone(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "Geçerli bir Türkiye telefon numarası girin",
        });
        return z.NEVER;
      }
      return normalized;
    }),
  city: z
    .string()
    .trim()
    .min(2, "Şehir en az 2 karakter olmalı")
    .max(100, "Şehir en fazla 100 karakter olabilir"),
  kvkk: z
    .union([z.boolean(), z.string()])
    .transform((value) => value === true || value === "true" || value === "on")
    .refine((value) => value === true, {
      message: "KVKK onayı gerekli",
    }),
});

export type ApplicationFieldsInput = z.infer<typeof applicationFieldsSchema>;

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

/** Dashboard profile + status/note/tags update payload. */
export const applicationUpdateSchema = z.object({
  status: applicationStatusSchema.optional(),
  admin_note: z.string().max(5000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  first_name: z
    .string()
    .trim()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .optional(),
  last_name: z
    .string()
    .trim()
    .min(2, "Soyad en az 2 karakter olmalı")
    .max(50, "Soyad en fazla 50 karakter olabilir")
    .optional(),
  phone: z
    .string()
    .trim()
    .min(1, "Telefon gerekli")
    .transform((value, ctx) => {
      const normalized = normalizeTrPhone(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "Geçerli bir Türkiye telefon numarası girin",
        });
        return z.NEVER;
      }
      return normalized;
    })
    .optional(),
  city: z
    .string()
    .trim()
    .min(2, "Şehir en az 2 karakter olmalı")
    .max(100, "Şehir en fazla 100 karakter olabilir")
    .optional(),
  birth_date: z
    .union([birthDateField, z.literal(""), z.null()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return null;
      return value;
    }),
  /** Independent of birth_date — never auto-derived. */
  age: ageField,
  gender: z
    .union([z.enum(APPLICATION_GENDERS), z.literal(""), z.null()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return null;
      return value;
    }),
  height_cm: heightCmField,
  weight_kg: weightKgField,
  hair_color: optionalText(80, "Saç rengi"),
  eye_color: optionalText(80, "Göz rengi"),
  experience: optionalText(3000, "Deneyim"),
  projects: optionalText(5000, "Oynadığı projeler"),
});

export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
