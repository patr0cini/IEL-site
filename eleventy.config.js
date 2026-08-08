import { interpretar } from "./tools/referencias.js";

const escaparHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // Envolve cada referência num troço com o texto do versículo, para
  // aparecer numa janela ao passar o rato. O texto vem de
  // src/assets/data/versiculos.json (ver tools/bpt-gerar-versiculos.py).
  const marcarReferencias = (texto) =>
    interpretar(texto)
      .map((parte) => {
        if (parte.tipo !== "referencia") return parte.texto;
        const chaves = parte.chaves.join(",");
        const aberto = parte.aberto ? ' data-mais="1"' : "";
        return `<button type="button" class="ref" data-ref="${chaves}"${aberto}>${escaparHtml(parte.texto)}</button>`;
      })
      .join("");

  eleventyConfig.addTransform("referenciasBiblicas", function (conteudo) {
    if (!this.page.outputPath?.endsWith(".html")) return conteudo;

    // Dentro do corpo de cada artigo da confissão, as referências vivem em
    // parênteses no meio do texto. Envolve as que forem reconhecidas.
    return conteudo.replace(
      /(<div class="creed__body">)([\s\S]*?)(<\/div>\s*<\/details>)/g,
      (bloco, abre, corpo, fecha) => {
        const novo = corpo.replace(/\(([^()]*\d[^()]*)\)/g, (paren, interior) => {
          const partes = interpretar(interior);
          if (!partes.some((p) => p.tipo === "referencia")) return paren;
          return `(${marcarReferencias(interior)})`;
        });
        return abre + novo + fecha;
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
