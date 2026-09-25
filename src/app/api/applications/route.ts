import { NextResponse } from "next/server";
import { createPublicApplication } from "@/lib/applications/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const honeypot = String(formData.get("website") ?? "");

    const photos = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (process.env.NODE_ENV === "development") {
      console.warn("[api/applications] POST", {
        photoCount: photos.length,
        hasKvkk: Boolean(formData.get("kvkk")),
        honeypotFilled: Boolean(honeypot.trim()),
      });
    }

    const result = await createPublicApplication({
      fields: {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        kvkk: formData.get("kvkk"),
      },
      photos,
      honeypot,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      message:
        "Başvurunuz başarıyla alındı. Uygun adaylarla iletişime geçilecektir.",
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[api/applications] unexpected", {
        message: err instanceof Error ? err.message : "unknown",
      });
    }
    return NextResponse.json(
      { error: "Başvuru gönderilemedi. Lütfen daha sonra tekrar deneyin." },
      { status: 500 },
    );
  }
}
