const navToggle = document.querySelector('[data-nav-toggle]');
const navigation = document.querySelector('.site-nav');

if (navToggle && navigation) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });
}

document.querySelectorAll('[data-submenu-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.site-nav__item');
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('[data-submenu-toggle]').forEach((other) => {
      if (other !== button) {
        other.setAttribute('aria-expanded', 'false');
        other.closest('.site-nav__item')?.classList.remove('is-open');
      }
    });
    button.setAttribute('aria-expanded', String(!isOpen));
    item?.classList.toggle('is-open', !isOpen);
  });
});
