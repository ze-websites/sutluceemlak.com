export default {
  eleventyComputed: {
    // Eski ilanlarda alan bulunmadığı için yalnızca açıkça pasif yapılanları gizle.
    permalink: data => data.active === false ? false : data.permalink
  }
};
