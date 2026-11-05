/* ==========================================================
   Montechã — vídeo do defumador controlado pelo scroll
   (mesma técnica do site-bacon: sequência de frames num <canvas>)
   ========================================================== */
(function () {
  const canvas = document.getElementById('video-defumador');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const etapas = document.querySelectorAll('.etapa');
  const TOTAL = 240;
  // Celular: vídeo vertical 9:16 (540x960, pasta frames-v) e só 1 a cada 2 frames. Gasta bem menos memória.
  // A pasta frames-v só tem os arquivos ímpares (frame_0001, 0003...), que são os únicos usados com PASSO = 2.
  // Nos frames 47 a 105 o logo do painel (inventado pela IA) foi borrado.
  const CELULAR = innerWidth < 768;
  const PASTA = CELULAR ? 'frames-v' : 'frames';
  const PASSO = CELULAR ? 2 : 1;
  if (CELULAR) { canvas.width = 540; canvas.height = 960; }
  const K = Math.max(canvas.width, canvas.height) / 1280;   // escala dos cantos e sombras do efeito
  const arquivo = (i, pasta = PASTA) => `${pasta}/frame_${String(i + 1).padStart(4, '0')}.webp`;
  // Os textos das etapas trocam em frames diferentes em cada vídeo (data-ini/data-fim ou data-ini-m/data-fim-m)
  const faixa = el => CELULAR ? [+el.dataset.iniM, +el.dataset.fimM] : [+el.dataset.ini, +el.dataset.fim];

  // ---- Sem animação: mostra as 5 etapas como fotos fixas ----
  // Usado quando a pessoa pediu "reduzir movimento" OU quando as bibliotecas de animação
  // não carregaram (bloqueador, sem internet...). Assim nunca fica uma imagem congelada.
  function modoSemAnimacao(motivo) {
    if (motivo) console.warn('[Montechã] Animação desligada:', motivo);
    document.documentElement.classList.remove('js-anima');
    document.documentElement.classList.add('sem-movimento');
    document.querySelectorAll('.revelar').forEach(el => el.classList.add('visivel'));
    const lista = document.querySelector('.etapas-fixas');
    if (lista.children.length) return;
    etapas.forEach(el => {
      const meio = Math.round((+el.dataset.ini + +el.dataset.fim) / 2);   // usa sempre o vídeo horizontal
      const li = document.createElement('li');
      li.innerHTML = `<img src="${arquivo(meio, 'frames')}" alt="" width="1280" height="720" loading="lazy">
        <strong>${el.querySelector('.etapa-titulo').textContent}</strong>
        <span>${el.querySelector('.etapa-texto').textContent}</span>`;
      lista.appendChild(li);
    });
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
  }
  if (SEM_MOVIMENTO) {
    modoSemAnimacao(/[?&]sem-movimento/.test(location.search)
      ? 'endereço com ?sem-movimento'
      : 'o aparelho está com "reduzir movimento" ligado (acessibilidade ou economia de bateria)');
    return;
  }
  // A janela mudou entre celular e computador (girar o celular, sair do modo celular do F12):
  // recarrega para trocar entre o vídeo vertical e o horizontal.
  matchMedia('(max-width: 767.98px)').addEventListener('change', () => location.reload());

  if (!window.gsap || !window.ScrollTrigger) { modoSemAnimacao('GSAP/ScrollTrigger não carregou'); return; }

  // ---- AJUSTES — mexa aqui ----
  //  "dur" = quanto de scroll a cena ocupa (1 = normal)
  // Os vídeos têm transições próprias entre as cenas; esses trechos ficam de fora e entra o efeito do site.
  const cenas = CELULAR ? [
    { ini: 0,   fim: 44,  dur: 1 },    // mascote pendurando o bacon
    { ini: 58,  fim: 94,  dur: 1 },    // lenha no defumador
    { ini: 106, fim: 142, dur: 1 },    // fumaça
    { ini: 154, fim: 239, dur: 1.7 },  // fatiadora → seladora → embalagens
  ] : [
    { ini: 0,   fim: 34,  dur: 1 },    // mascote pendurando o bacon
    { ini: 35,  fim: 70,  dur: 1 },    // lenha no defumador
    { ini: 71,  fim: 106, dur: 1 },    // fumaça
    { ini: 107, fim: 239, dur: 1.7 },  // fatiadora → embalagens (o vídeo já tem transição própria aqui)
  ];
  const PAUSA = 0.3;        // tempo parado no fim da cena, antes do efeito
  const TRANSICAO = 0.6;    // duração do efeito de troca de cena
  const FUNDO = '#1E1517';  // cor que aparece atrás dos "cartões" na transição

  // ---- Carregamento dos frames ----
  // Só começa a baixar quando a seção está chegando perto da tela.
  const frames = new Array(TOTAL);
  const carregar = i => { const img = new Image(); img.decoding = 'async'; img.src = arquivo(i); frames[i] = img; return img; };
  carregar(0).onload = () => desenhar();
  new IntersectionObserver((entradas, obs) => {
    if (!entradas[0].isIntersecting) return;
    for (let i = PASSO; i < TOTAL; i += PASSO) carregar(i);
    obs.disconnect();
  }, { rootMargin: '1500px 0px' }).observe(canvas.closest('.defumador'));

  const pronto = img => img && img.complete && img.naturalWidth > 0;
  function frameMaisProximo(n) {                 // o frame pedido, ou o anterior já carregado
    n -= n % PASSO;
    while (n > 0 && !pronto(frames[n])) n -= PASSO;
    return pronto(frames[n]) ? frames[n] : null;
  }

  // ---- Sequência: cena → pausa → transição → próxima cena ----
  const trechos = [];
  cenas.forEach((c, i) => {
    trechos.push({ tipo: 'cena', ini: c.ini, fim: c.fim, dur: c.dur });
    const prox = cenas[i + 1];
    if (prox) {
      trechos.push({ tipo: 'pausa', ini: c.fim, fim: c.fim, dur: PAUSA });
      trechos.push({ tipo: 'transicao', ini: c.fim, fim: prox.ini, dur: TRANSICAO });
    }
  });
  const DURACAO = trechos.reduce((s, t) => s + t.dur, 0);

  // ---- Desenho ----
  function pintar(n) {
    const img = frameMaisProximo(n);
    if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // Frame como "cartão": tamanho, deslocamento, cantos, escurecimento e sombra
  function cartao(n, escala, desceY, raio, escuro, sombra) {
    const img = frameMaisProximo(n);
    if (!img) return;
    const w = canvas.width * escala, h = canvas.height * escala;
    const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2 + desceY;
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, raio); else ctx.rect(x, y, w, h);
    if (sombra) {
      ctx.shadowColor = 'rgba(0,0,0,.6)';
      ctx.shadowBlur = 60 * K;
      ctx.fillStyle = FUNDO;
      ctx.fill();
      ctx.shadowColor = 'transparent';
    }
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    if (escuro > 0) { ctx.fillStyle = `rgba(0,0,0,${escuro})`; ctx.fillRect(x, y, w, h); }
    ctx.restore();
  }

  // Efeito "subir": a cena atual encolhe para trás e a próxima sobe por cima
  function transicao(de, para, p) {
    const encolhe = 1 - Math.pow(1 - Math.min(1, p * 1.4), 3);
    const sobe = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    ctx.fillStyle = FUNDO;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    cartao(de, 1 - 0.2 * encolhe, 0, 28 * K * encolhe, 0.6 * encolhe, false);
    cartao(para, 1, canvas.height * (1 - sobe), 28 * K * (1 - sobe), 0, true);
  }

  const estado = { t: 0 };
  function desenhar() {
    let t = estado.t, trecho = trechos[trechos.length - 1], p = 1;
    for (const tr of trechos) {
      if (t <= tr.dur) { trecho = tr; p = t / tr.dur; break; }
      t -= tr.dur;
    }
    let n;
    if (trecho.tipo === 'transicao') {
      transicao(trecho.ini, trecho.fim, p);
      n = p < 0.5 ? trecho.ini : trecho.fim;     // texto troca no meio do efeito
    } else {
      n = Math.round(trecho.ini + (trecho.fim - trecho.ini) * p);
      pintar(n);
    }
    etapas.forEach(el => { const [a, b] = faixa(el); el.classList.toggle('ativa', n >= a && n <= b); });
  }

  // ---- Ligação com o scroll ----
  try {
  gsap.registerPlugin(ScrollTrigger);
  // No celular, a barra de endereço aparece/some e muda a altura da tela: não recalcula por isso
  ScrollTrigger.config({ ignoreMobileResize: true });

  // O vídeo termina 1 tela antes do fim da seção: essa última tela é quando o catálogo sobe por cima
  gsap.to(estado, {
    t: DURACAO,
    ease: 'none',
    onUpdate: desenhar,
    scrollTrigger: { trigger: '.historia', start: 'top top', end: 'bottom 200%', scrub: 1 },
  });

  // Enquanto o catálogo sobe, o vídeo (já parado nas embalagens) encolhe e escurece
  gsap.fromTo(canvas,
    { scale: 1, borderRadius: 0, filter: 'brightness(1)' },
    { scale: 0.9, borderRadius: 28, filter: 'brightness(0.45)', ease: 'none',
      scrollTrigger: { trigger: '#produtos', start: 'top bottom', end: 'top top', scrub: true } });

  // As fontes e imagens mudam a altura da página depois de carregar: recalcula as posições
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // Esconde os textos das etapas quando o catálogo começa a subir
  ScrollTrigger.create({
    trigger: '#produtos', start: 'top 85%',
    onEnter: () => etapas.forEach(el => el.style.visibility = 'hidden'),
    onLeaveBack: () => etapas.forEach(el => el.style.visibility = ''),
  });
  } catch (erro) {
    modoSemAnimacao(erro);
  }
})();
