import { badRequest, serverError } from "@/lib/api/auth";
import { createContact } from "@/lib/contacts/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      website?: string;
    };

    await createContact({
      name: String(body.name || ""),
      email: String(body.email || ""),
      phone: body.phone,
      subject: String(body.subject || ""),
      message: String(body.message || ""),
      honeypot: body.website,
    });

    return NextResponse.json({
      ok: true,
      message: "Mesajınız alındı. En kısa sürede dönüş yapılacaktır.",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "invalid_email") {
      return badRequest("Geçerli bir e-posta girin.");
    }
    if (err instanceof Error && err.message === "validation_failed") {
      return badRequest("Lütfen zorunlu alanları doldurun.");
    }
    return serverError("Mesaj gönderilemedi.");
  }
}
