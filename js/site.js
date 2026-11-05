/* ==========================================================
   Montechã — configurações gerais e comportamentos do site
   (usado nas duas páginas: index.html e produtos.html)
   ========================================================== */

// ---- AJUSTES — mexa aqui ----
const CONFIG = {
  // Equipe de vendas (WhatsApp e ligação). Número: DDI + DDD + número, só algarismos.
  vendedores: [
    { nome: 'Mayara',  papel: 'Vendas',           numero: '5537999243262', telefone: '(37) 9 9924-3262' },
    { nome: 'Clayton', papel: 'Vendas e revenda', numero: '5537991690232', telefone: '(37) 9 9169-0232' },
  ],
  // Nome do mascote. Vazio = os textos aparecem sem nome.
  nomeMascote: 'Zé du Bacon',
};

const SEM_MOVIMENTO = document.documentElement.classList.contains('sem-movimento');

// ---- Links do WhatsApp ----
function linkWhats(mensagem, vendedor = CONFIG.vendedores[0]) {
  return `https://wa.me/${vendedor.numero}?text=${encodeURIComponent(mensagem)}`;
}
// Todo link com data-whats ganha um endereço de reserva (caso o JavaScript falhe).
// data-vendedor="0" ou "1" vai direto para aquele vendedor; sem ele, o clique abre a escolha.
function ligarWhats(raiz = document) {
  raiz.querySelectorAll('[data-whats]').forEach(a => {
    const fixo = a.dataset.vendedor !== undefined ? CONFIG.vendedores[+a.dataset.vendedor] : undefined;
    a.href = linkWhats(a.dataset.whats, fixo);
  });
}
ligarWhats();

// ---- Nome do mascote ----
if (CONFIG.nomeMascote) {
  document.querySelectorAll('[data-mascote]').forEach(el => {
    el.textContent = el.dataset.mascote.replace('{nome}', CONFIG.nomeMascote);
  });
  document.querySelectorAll('[data-so-com-nome]').forEach(el => { el.hidden = false; });
}

// ---- Menu de três risquinhos (telas menores) ----
const menu = document.querySelector('.menu');
const menuAbrir = document.querySelector('.menu-abrir');
function menuAberto(abrir) {
  menu.classList.toggle('aberto', abrir);
  menuAbrir.setAttribute('aria-expanded', String(abrir));
  menuAbrir.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
}
if (menu && menuAbrir) {
  menuAbrir.addEventListener('click', () => menuAberto(!menu.classList.contains('aberto')));
  document.addEventListener('click', e => {
    if (!menu.classList.contains('aberto')) return;
    if (e.target.closest('.menu-links a') || !e.target.closest('.menu-barra')) menuAberto(false);  // escolheu ou clicou fora
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('aberto')) { menuAberto(false); menuAbrir.focus(); }
  });
  matchMedia('(min-width: 1101px)').addEventListener('change', e => { if (e.matches) menuAberto(false); });
}

// ---- Menu fixo ao rolar (como na Granja Brasília) ----
// No topo fica a barra grande, com a logo inteira de 370px (mínimo do Guia de Marca), que rola junto
// com a página. Depois que ela sai da tela, desce uma barra compacta fixa com o símbolo (.compacto).
if (menu) {
  let limite = 0;
  const medir = () => {
    if (!menu.classList.contains('compacto')) limite = menu.offsetTop + menu.offsetHeight;
  };
  const atualizar = () => {
    const compacto = window.scrollY > limite;
    if (compacto !== menu.classList.contains('compacto')) menu.classList.toggle('compacto', compacto);
  };
  medir(); atualizar();
  window.addEventListener('scroll', atualizar, { passive: true });
  window.addEventListener('resize', () => { medir(); atualizar(); });
}

// ---- Escolha do vendedor: dois cartões que sobem acima do botão "Pedidos" ----
const botaoFlutuante = document.querySelector('.whats-flutuante');
const escolha = document.createElement('div');
escolha.className = 'escolha';
escolha.id = 'escolha-vendedor';
escolha.hidden = true;
escolha.setAttribute('role', 'dialog');
escolha.setAttribute('aria-label', 'Escolha com quem falar');
// Símbolo do WhatsApp (o mesmo em todo o site)
const ICONE_WHATS = `<svg class="icone-whats" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

escolha.innerHTML = `<p class="escolha-titulo">Com quem você quer falar?</p>` + CONFIG.vendedores.map((v, i) => `
  <div class="escolha-cartao">
    <strong>${v.nome}</strong>
    <span class="escolha-papel">${v.papel}</span>
    <a class="escolha-numero" data-escolha="${i}" href="https://wa.me/${v.numero}" target="_blank" rel="noopener">${ICONE_WHATS}<span>${v.telefone}</span></a>
  </div>`).join('');
document.body.appendChild(escolha);
if (botaoFlutuante) {
  botaoFlutuante.setAttribute('aria-controls', escolha.id);
  botaoFlutuante.setAttribute('aria-expanded', 'false');
}

let origemEscolha = null;
let rodapeVisivel = false;

function atualizarFlutuante() {
  if (!botaoFlutuante) return;
  botaoFlutuante.classList.toggle('escondido', rodapeVisivel && escolha.hidden);
}

function abrirEscolha(mensagem, origem, peloTeclado = false) {
  origemEscolha = origem;
  escolha.querySelectorAll('[data-escolha]').forEach(a => {
    const v = CONFIG.vendedores[+a.dataset.escolha];
    a.href = linkWhats(mensagem, v);
    a.setAttribute('aria-label', `Chamar ${v.nome} no WhatsApp: ${v.telefone}`);
  });
  escolha.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => escolha.classList.add('aberta')));
  if (botaoFlutuante) {
    botaoFlutuante.classList.add('aberto');
    botaoFlutuante.classList.remove('escondido');
    botaoFlutuante.setAttribute('aria-expanded', 'true');
  }
  // Só leva o foco para o primeiro número quando abriu pelo teclado (no mouse, isso desenhava um contorno)
  if (peloTeclado) escolha.querySelector('[data-escolha]').focus({ preventScroll: true });
}

function fecharEscolha(devolverFoco = true) {
  if (escolha.hidden) return;
  escolha.classList.remove('aberta');
  if (botaoFlutuante) {
    botaoFlutuante.classList.remove('aberto');
    botaoFlutuante.setAttribute('aria-expanded', 'false');
  }
  setTimeout(() => {
    if (!escolha.classList.contains('aberta')) { escolha.hidden = true; atualizarFlutuante(); }
  }, 320);
  if (devolverFoco && origemEscolha) origemEscolha.focus({ preventScroll: true });
}

document.addEventListener('click', e => {
  const link = e.target.closest('a[data-whats]');
  if (link && link.dataset.vendedor === undefined) {
    e.preventDefault();
    if (link === botaoFlutuante && !escolha.hidden) fecharEscolha();
    else abrirEscolha(link.dataset.whats, link, e.detail === 0);   // detail 0 = Enter no teclado
    return;
  }
  if (escolha.hidden) return;
  if (e.target.closest('.escolha a')) setTimeout(() => fecharEscolha(false), 150);   // escolheu: fecha
  else if (!e.target.closest('.escolha')) fecharEscolha(false);                       // clicou fora
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharEscolha(); });

// ---- Botão flutuante some quando o rodapé aparece (o rodapé já mostra os contatos) ----
const rodape = document.querySelector('.rodape');
if (botaoFlutuante && rodape) {
  new IntersectionObserver(([e]) => { rodapeVisivel = e.isIntersecting; atualizarFlutuante(); }).observe(rodape);
}

// ---- Entrada suave dos blocos ao rolar ----
const observadorRevelar = SEM_MOVIMENTO ? null : new IntersectionObserver((entradas) => {
  entradas.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visivel'); observadorRevelar.unobserve(e.target); }
  });
}, { rootMargin: '0px 0px -8% 0px' });

function observarRevelar(raiz = document) {
  if (!observadorRevelar) return;
  raiz.querySelectorAll('.revelar:not(.visivel)').forEach(el => observadorRevelar.observe(el));
}
observarRevelar();

// ---- Link para uma seção vindo de outra página (ex.: index.html#como-pedir) ----
// O navegador pula antes das fontes e da animação acertarem a altura da página,
// então a seção "anda". Quando tudo carrega, pulamos de novo — se a pessoa ainda não rolou.
// Ao recarregar (F5) ou voltar, o navegador já devolve a pessoa onde ela estava: não mexemos.
const tipoNavegacao = (performance.getEntriesByType?.('navigation')[0] || {}).type;
if (location.hash.length > 1 && tipoNavegacao !== 'reload' && tipoNavegacao !== 'back_forward') {
  let mexeu = false;
  const marcar = () => { mexeu = true; };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(ev => addEventListener(ev, marcar, { once: true, passive: true }));
  const repular = () => {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch (e) { /* endereço malformado: usa como veio */ }
    const alvo = document.getElementById(id);
    if (!alvo || mexeu) return;
    alvo.scrollIntoView({ block: 'start', behavior: 'instant' });   // sem animação: é só acertar a posição
  };
  const depoisDoLoad = () => {
    setTimeout(repular, 150);                                      // depois do refresh do ScrollTrigger
    if (document.fonts) document.fonts.ready.then(() => setTimeout(repular, 150));
  };
  if (document.readyState === 'complete') depoisDoLoad(); else addEventListener('load', depoisDoLoad, { once: true });
}
