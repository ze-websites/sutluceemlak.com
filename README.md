# Sütlüce Emlak — Eleventy + Decap CMS

## Kurulum

```bash
npm install
npm run dev
```

- Site: `http://localhost:8082`
- CMS: `http://localhost:8082/admin/`
- Üretim derlemesi: `npm run build`
- Çıktı klasörü: `_site`

## İçerik yönetimi

- `src/ilanlar`: İlanlar
- `src/blog`: Blog yazıları
- `src/_data/site.json`: İletişim ve genel site ayarları

Yerel CMS geliştirmesi için ayrı terminalde `npx decap-server` çalıştırın.

Canlı CMS, Vercel üzerindeki GitHub OAuth fonksiyonlarını kullanır. GitHub OAuth App
callback adresi `https://www.sutluceemlak.com/api/complete` olmalıdır. Vercel projesine
`GITHUB_CLIENT_ID` ve `GITHUB_CLIENT_SECRET` ortam değişkenlerini ekleyin.
