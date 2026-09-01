export default function (eleventyConfig) {
  eleventyConfig.addFilter("isoDate", value => new Date(value).toISOString().slice(0, 10));
  eleventyConfig.addFilter("json", value => JSON.stringify(value));
  eleventyConfig.addFilter("localListings", (items, status, area) =>
    items.filter(item =>
      item.data.status === status &&
      item.data.propertyType === "Konut" &&
      Array.isArray(item.data.areas) &&
      item.data.areas.includes(area)
    )
  );
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  // Vercel `/admin` yolunu son eğik çizgi olmadan da sunar. Decap bu URL'de
  // config dosyasını `/config.yml` altında aradığı için iki yolu da yayımla.
  eleventyConfig.addPassthroughCopy({ "src/admin/config.yml": "config.yml" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/heic2any/dist/heic2any.min.js": "admin/vendor/heic2any.min.js"
  });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });

  eleventyConfig.addCollection("ilanlar", collection =>
    collection.getFilteredByGlob("src/ilanlar/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("yazilar", collection =>
    collection.getFilteredByGlob("src/blog/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
