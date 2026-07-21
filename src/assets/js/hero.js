// Carrega o vídeo do banner apenas quando faz sentido:
// ecrãs largos, sem poupança de dados e sem preferência por menos movimento.
// Caso contrário fica só a imagem (poster), que já está no CSS.
const heroVideo = document.querySelector('[data-hero-video]');

if (heroVideo) {
  const wideScreen = window.matchMedia('(min-width: 48rem)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;

  if (wideScreen && !reducedMotion && !saveData) {
    heroVideo.src = heroVideo.dataset.src;
    heroVideo.play().catch(() => {
      // se o navegador recusar a reprodução automática, o poster mantém-se
    });
  }
}
