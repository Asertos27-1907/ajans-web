import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-display mt-3 text-3xl font-semibold">Sayfa bulunamadı</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        Aradığınız sayfa taşınmış veya kaldırılmış olabilir.
      </p>
      <Link href="/" className="mt-6">
        <Button>Ana sayfaya dön</Button>
      </Link>
    </div>
  );
}
