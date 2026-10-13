// Gera uma "versão" curta de cada ficheiro de CSS/JS a partir do seu conteúdo.
// Usada em base.njk como ?v=... para que o browser vá buscar a versão nova
// sempre que o ficheiro muda (evita ficar com CSS/JS antigo em cache).

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const versao = (caminho) => {
  try {
    return createHash("sha1").update(readFileSync(caminho)).digest("hex").slice(0, 8);
  } catch {
    return "1";
  }
};

export default {
  style: versao("src/assets/css/style.css"),
  fonts: versao("src/assets/css/fonts.css"),
  nav: versao("src/assets/js/nav.js"),
  contact: versao("src/assets/js/contact.js"),
  hero: versao("src/assets/js/hero.js"),
  versiculos: versao("src/assets/js/versiculos.js"),
};
