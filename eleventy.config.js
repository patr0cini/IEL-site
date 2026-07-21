import { interpretar } from "./tools/referencias.js";

const escaparHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // Torna cada referência bíblica num alvo com o texto do versículo.
  // O texto vem de src/assets/data/versiculos.json (ver tools/gerar-versiculos.mjs).
  eleventyConfig.addTransform("referenciasBiblicas", function (conteudo) {
    if (!this.page.outputPath?.endsWith(".html")) return conteudo;

    return conteudo.replace(
      /<p class="creed__refs">([\s\S]*?)<\/p>/g,
      (todo, interior) => {
        const partes = interpretar(interior)
          .map((parte) => {
            if (parte.tipo !== "referencia") return parte.texto;
            const chaves = parte.chaves.join(",");
            const aberto = parte.aberto ? ' data-mais="1"' : "";
            return `<button type="button" class="ref" data-ref="${chaves}"${aberto}>${escaparHtml(parte.texto)}</button>`;
          })
          .join("");
        return `<p class="creed__refs">${partes}</p>`;
      },
    );
  });

  // Data global disponível em todas as páginas via _data/site.json

  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("dateDisplay", (date) => new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(date));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
