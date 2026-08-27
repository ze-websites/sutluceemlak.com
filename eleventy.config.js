export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
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
