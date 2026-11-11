/* ==========================================================
   Montechã — catálogo de produtos
   Para incluir, tirar ou mudar um produto, edite só a lista PRODUTOS.
   Fotos ficam em img/produtos/<foto>-embalagem.webp e <foto>-aberto.webp
   ========================================================== */

const FAMILIAS = {
  peca:      'Bacon em peça',
  fatiados:  'Fatiados e cubos',
  embutidos: 'Embutidos',
  cozidos:   'Cozidos',
};

const PRODUTOS = [
  { nome: 'Bacon Manta', familia: 'peca', foto: 'bacon-manta', formatos: ['Peça'],
    desc: 'Bacon defumado em manta inteira, para fatiar do jeito que o seu cliente preferir.' },
  { nome: 'Bacon de Paleta Cozida', familia: 'peca', foto: 'bacon-paleta-peca', formatos: ['Peça'],
    desc: 'Paleta suína cozida e defumada, em peça.' },
  { nome: 'Bacon Triângulo', familia: 'peca', foto: 'bacon-triangulo', formatos: ['Peça'],
    desc: 'Corte triangular defumado, muito usado em feijão, tropeiro e caldos.' },
  { nome: 'Bacon em Cubos', familia: 'fatiados', foto: 'bacon-cubos-200g', formatos: ['200 g'],
    desc: 'Pronto para usar, direto na panela. Tamanho ideal para a gôndola.' },
  { nome: 'Bacon de Paleta Cozida em Cubos', familia: 'fatiados', foto: 'paleta-cubos-1kg', formatos: ['1 kg'],
    desc: 'Cubos padronizados, prontos para usar.' },
  { nome: 'Bacon de Paleta Cozida Fatiado', familia: 'fatiados', foto: 'paleta-fatiado-1kg', formatos: ['1 kg'],
    desc: 'Fatias prontas para lanches, pizzas e pratos executivos.' },
  { nome: 'Papada Temperada Fatiada', familia: 'fatiados', foto: 'papada-fatiada-1kg', formatos: ['1 kg'],
    desc: 'Papada suína temperada, cozida e defumada, já fatiada.' },
  { nome: 'Linguiça Tipo Calabresa', familia: 'embutidos', foto: 'calabresa', semAberto: true, formatos: ['2,5 kg'],
    desc: 'Cozida e defumada. Clássica na pizza, no lanche e no petisco.' },
  { nome: 'Salaminho Maria Rosa', familia: 'embutidos', foto: 'salaminho', formatos: ['1 kg a vácuo', '5 kg a granel'],
    desc: 'Embutido cozido estilo calabresa, em peça longa enrolada.' },
  { nome: 'Carne Suína Temperada em Cubos', familia: 'cozidos', foto: 'carne-suina-cubos-1kg', formatos: ['1 kg'],
    desc: 'Carne suína sem osso, temperada e cozida, com sabor defumado.' },
];

(function montarCatalogo() {
  const grade = document.querySelector('.grade-produtos');
  const barraFiltros = document.querySelector('.filtros');   // só existe na página de produtos
  if (!grade) return;

  // Página inicial: data-destaques="foto1,foto2,..." mostra só esses produtos
  const destaques = grade.dataset.destaques ? grade.dataset.destaques.split(',').map(s => s.trim()) : null;
  const lista = destaques ? destaques.map(f => PRODUTOS.find(p => p.foto === f)).filter(Boolean) : PRODUTOS;

  // Cartões
  grade.innerHTML = lista.map(p => `
    <article class="produto revelar" data-familia="${p.familia}">
      <figure class="produto-foto">
        <img class="embalagem" src="img/produtos/${p.foto}-embalagem.webp" alt="Embalagem: ${p.nome}" width="640" height="800" loading="lazy">
        ${p.semAberto ? '' : `
        <img class="aberto" src="img/produtos/${p.foto}-aberto.webp" alt="${p.nome} fora da embalagem" width="640" height="800" loading="lazy">
        <button class="ver-aberto" type="button" aria-pressed="false">Ver produto</button>`}
      </figure>
      <div class="produto-corpo">
        <span class="produto-familia">${FAMILIAS[p.familia]}</span>
        <h3>${p.nome}</h3>
        <p class="produto-desc">${p.desc}</p>
        <ul class="formatos" aria-label="Formatos disponíveis">${p.formatos.map(f => `<li>${f}</li>`).join('')}</ul>
        <a class="botao botao-vinho" data-whats="Olá! Vim pelo site e quero a tabela do produto ${p.nome}." href="https://wa.me/${CONFIG.vendedores[0].numero}" target="_blank" rel="noopener">Pedir este produto</a>
      </div>
    </article>`).join('');

  // Botão "Ver produto" (para toque e teclado; no mouse a troca é ao passar por cima)
  grade.addEventListener('click', e => {
    const botao = e.target.closest('.ver-aberto');
    if (!botao) return;
    const foto = botao.closest('.produto-foto');
    const mostrando = foto.classList.toggle('mostrar');
    botao.setAttribute('aria-pressed', mostrando);
    botao.textContent = mostrando ? 'Ver embalagem' : 'Ver produto';
  });

  ligarWhats(grade);
  observarRevelar(grade);

  // Filtros (só na página de produtos)
  if (!barraFiltros) return;
  const contagem = f => PRODUTOS.filter(p => !f || p.familia === f).length;
  const opcoes = [['', 'Todos'], ...Object.entries(FAMILIAS)];
  barraFiltros.innerHTML = opcoes.map(([chave, rotulo]) =>
    `<button class="filtro" type="button" data-filtro="${chave}" aria-pressed="${chave === ''}">${rotulo}</button>`
  ).join('');

  barraFiltros.addEventListener('click', e => {
    const botao = e.target.closest('.filtro');
    if (!botao) return;
    const filtro = botao.dataset.filtro;
    barraFiltros.querySelectorAll('.filtro').forEach(b => b.setAttribute('aria-pressed', b === botao));
    grade.querySelectorAll('.produto').forEach(card => {
      card.hidden = !!filtro && card.dataset.familia !== filtro;
      if (!card.hidden) card.classList.add('visivel');
    });
    // Aviso curto para leitores de tela (em vez de ler a lista inteira de novo)
    const n = contagem(filtro);
    const status = document.getElementById('status-filtro');
    if (status) status.textContent = `${n} ${n === 1 ? 'produto' : 'produtos'}${filtro ? ' em ' + FAMILIAS[filtro] : ''}`;
  });
})();
