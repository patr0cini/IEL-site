---
layout: layouts/page.njk
title: Onde Estamos
eyebrow: Visite-nos
lead: Será muito bem-vindo na Igreja Evangélica de Livramento.
---

<div class="contact-grid">
  <section aria-labelledby="contactos-title">
    <h2 id="contactos-title">Contactos</h2>
    <ul class="contact-list">
      <li><strong>Morada</strong><a href="{{ site.address.mapsUrl }}" target="_blank" rel="noopener">{{ site.address.street }}<br>{{ site.address.postal }}</a></li>
      <li><strong>Email</strong><a href="mailto:{{ site.email }}">{{ site.email }}</a></li>
      <li><strong>Telefone</strong><a href="tel:+351{{ site.phone }}">{{ site.phoneDisplay }}</a><span class="contact-note">{{ site.phoneNote }}</span></li>
    </ul>
    <p>Encontre também a igreja no <a href="{{ site.social.facebook }}" target="_blank" rel="noopener">Facebook</a> e no <a href="{{ site.social.youtube }}" target="_blank" rel="noopener">YouTube</a>.</p>
  </section>
  <section aria-labelledby="form-title">
    <h2 id="form-title">Envie-nos uma mensagem</h2>
    <p>Ao enviar, o seu programa de email abrirá uma nova mensagem para <a href="mailto:{{ site.email }}">{{ site.email }}</a>.</p>
    <form class="contact-form" data-contact-form>
      <div class="form-row"><div class="form-field"><label for="nome">Nome</label><input id="nome" name="nome" autocomplete="given-name" required></div><div class="form-field"><label for="sobrenome">Sobrenome</label><input id="sobrenome" name="sobrenome" autocomplete="family-name" required></div></div>
      <div class="form-field"><label for="email">Email</label><input id="email" type="email" name="email" autocomplete="email" required></div>
      <div class="form-field"><label for="mensagem">Mensagem</label><textarea id="mensagem" name="mensagem" rows="6" required></textarea></div>
      <button class="btn btn--primary" type="submit">Enviar</button>
      <p class="form-confirmation" data-contact-confirmation hidden role="status">Obrigado pelo envio! O seu programa de email será aberto para concluir a mensagem.</p>
    </form>
  </section>
</div>

<section class="map-section" aria-labelledby="mapa-title">
  <h2 id="mapa-title">Como chegar</h2>
  <div class="embed embed--map"><iframe title="Mapa da Igreja Evangélica de Livramento" loading="lazy" src="https://www.google.com/maps?q=Largo%20das%20Courelas%208%2C%202665-001%20Azueira&output=embed"></iframe></div>
</section>
