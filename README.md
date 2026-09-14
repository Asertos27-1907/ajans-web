# +Akademi Oyunculuk & Menajerlik

Production'a taşınabilir Next.js web sitesi ve yönetim paneli.

## Çalıştırma

```bash
npm install
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Mock login: [http://localhost:3000/dashboard/login](http://localhost:3000/dashboard/login)

```bash
npm run lint
npm run build
```

## Teknoloji

- Next.js (App Router) + TypeScript + Tailwind CSS
- Lucide Icons, date-fns, clsx, zod, xlsx

## Mimari

- `src/types` — domain tipleri
- `src/data/mock.ts` — mock veri
- `src/lib/repositories` — repository abstraction (ileride Supabase)
- `src/components/public|dashboard|forms|ui`
- `src/app/(public)` — public site
- `src/app/dashboard` — yönetim paneli

## Notlar

- Gerçek Supabase / Auth / Storage bu aşamada bağlı değildir.
- Telefon, e-posta, WhatsApp, YouTube, TikTok, LinkedIn boşsa frontend'de gösterilmez.
- CSV export mock veri üzerinde çalışır.
