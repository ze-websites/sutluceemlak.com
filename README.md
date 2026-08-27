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

Canlı ortamda `src/admin/config.yml` varsayılan olarak Netlify Git Gateway kullanır.
Netlify Identity ve Git Gateway servislerini etkinleştirin. Farklı bir Git sağlayıcısı
kullanılacaksa Decap CMS backend ayarını dağıtım ortamına göre değiştirin.
