const contactForm = document.querySelector('[data-contact-form]');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const firstName = data.get('nome');
    const lastName = data.get('sobrenome');
    const email = data.get('email');
    const message = data.get('mensagem');
    const subject = encodeURIComponent(`Contacto do site — ${firstName} ${lastName}`.trim());
    const body = encodeURIComponent(`Nome: ${firstName} ${lastName}\nEmail: ${email}\n\nMensagem:\n${message}`);
    const confirmation = document.querySelector('[data-contact-confirmation]');

    if (confirmation) confirmation.hidden = false;
    window.location.href = `mailto:info@iel.pt?subject=${subject}&body=${body}`;
  });
}
