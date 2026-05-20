const faixas = ["00 a 18","19 a 23","24 a 28","29 a 33","34 a 38","39 a 43","44 a 48","49 a 53","54 a 58","59 acima"];

const produtosConfig = [
  {id:"one", nome:"ONE", titulo:"Plano ONE BSB CE - Enfermaria Regional com Coparticipação"},
  {id:"evoNow", nome:"EVO NOW", titulo:"Plano EVO NOW - Enfermaria Regional com Coparticipação"},
  {id:"now", nome:"NOW", titulo:"Plano NOW - Enfermaria Regional com Coparticipação"}
];

function montarProdutos(){
  const area = document.getElementById("produtos");
  produtosConfig.forEach(p=>{
    const div = document.createElement("div");
    div.className = "produto";
    div.innerHTML = `
      <h3>${p.nome}</h3>
      <label>Título do plano
        <input id="${p.id}_titulo" value="${p.titulo}">
      </label>
      <div class="valores">
        ${faixas.map((f,i)=>`
          <label>${f}
            <input id="${p.id}_${i}" inputmode="numeric" placeholder="R$ 0,00">
          </label>
        `).join("")}
      </div>`;
    area.appendChild(div);
  });
}
montarProdutos();

function montarProdutosLineares(){
  const area = document.getElementById("produtosLineares");
  produtosConfig.forEach(p=>{
    const div = document.createElement("div");
    div.className = "produto";
    div.innerHTML = `
      <h3>${p.nome}</h3>
      <label>Produto
        <input id="${p.id}_linear_produto" value="${p.titulo}">
      </label>
      <div class="grid" style="margin-top:12px">
        <label>Quantidade de vidas
          <input id="${p.id}_linear_vidas" inputmode="numeric" placeholder="Ex.: 30">
        </label>
        <label>Preço linear
          <input id="${p.id}_linear_valor" inputmode="numeric" placeholder="R$ 0,00">
        </label>
      </div>`;
    area.appendChild(div);
  });
}
montarProdutosLineares();


const $ = id => (document.getElementById(id)?.value || "").trim();

function showLoading(text="Processando..."){
  const overlay = document.getElementById("loadingOverlay");
  const loadingText = document.getElementById("loadingText");
  if(loadingText) loadingText.textContent = text;
  overlay?.classList.remove("hidden");
}

function hideLoading(){
  document.getElementById("loadingOverlay")?.classList.add("hidden");
}

function toggleTheme(){
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("evoTheme", isDark ? "dark" : "light");
  const btn = document.getElementById("themeToggle");
  if(btn) btn.textContent = isDark ? "☀️" : "🌙";
}

function initTheme(){
  const saved = localStorage.getItem("evoTheme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = saved ? saved === "dark" : prefersDark;
  document.body.classList.toggle("dark", dark);
  const btn = document.getElementById("themeToggle");
  if(btn) btn.textContent = dark ? "☀️" : "🌙";
}

function showSkeleton(targetSelector=".card", duration=500){
  const items = document.querySelectorAll(targetSelector);
  items.forEach(el=>el.classList.add("skeleton"));
  setTimeout(()=>items.forEach(el=>el.classList.remove("skeleton")), duration);
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  showSkeleton(".card", 380);
});


function somenteDigitos(v){ return String(v || "").replace(/\D/g, ""); }

function formatarCEP(v){
  const d = somenteDigitos(v).slice(0,8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
}

async function buscarCEP(){
  const cepInput = document.getElementById("cep");
  const status = document.getElementById("cepStatus");
  const cep = somenteDigitos(cepInput.value);

  status.className = "";
  status.textContent = "";

  if(cep.length !== 8) return;

  try{
    status.textContent = "Buscando CEP...";
    showLoading("Buscando CEP...");
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if(data.erro){
      status.className = "erro";
      status.textContent = "CEP não encontrado.";
      hideLoading();
      return;
    }

    document.getElementById("cidade").value = data.localidade || "";
    document.getElementById("estado").value = data.uf || "";

    status.className = "ok";
    status.textContent = "Endereço preenchido automaticamente.";
    hideLoading();
  }catch(e){
    status.className = "erro";
    status.textContent = "Não foi possível consultar o CEP.";
    hideLoading();
  }
}

async function buscarCNPJ(){
  const cnpjInput = document.getElementById("cnpj");
  const status = document.getElementById("cnpjStatus");
  const cnpj = somenteDigitos(cnpjInput.value);

  status.className = "";
  status.textContent = "";

  if(cnpj.length !== 14) return;

  try{
    status.textContent = "Consultando CNPJ...";
    showLoading("Consultando CNPJ...");

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    const data = await response.json();

    if(!response.ok || data.message || data.type){
      status.className = "erro";
      status.textContent = "CNPJ não encontrado.";
      hideLoading();
      return;
    }

    document.getElementById("razaoSocial").value = data.razao_social || data.nome_fantasia || "";
    document.getElementById("cidade").value = data.municipio || "";
    document.getElementById("estado").value = data.uf || "";
    document.getElementById("cep").value = formatarCEP(data.cep || "");

    if(data.email){
    }

    if(data.ddd_telefone_1){
    }

    status.className = "ok";
    status.textContent = "Dados preenchidos automaticamente pelo CNPJ.";
    hideLoading();
  }catch(e){
    status.className = "erro";
    status.textContent = "Não foi possível consultar o CNPJ.";
    hideLoading();
  }
}

function formatarCNPJ(v){
  const d = somenteDigitos(v).slice(0,14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarMoedaBR(v){
  const d = somenteDigitos(v);
  if(!d) return "";
  const n = Number(d) / 100;
  return n.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
}

function formatarPercentual(v){
  const d = somenteDigitos(v).slice(0,5);
  if(!d) return "";

  const n = Number(d) / 100;

  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + "%";
}

function aplicarMascaraMoeda(el){
  el.addEventListener("input", () => {
    el.value = formatarMoedaBR(el.value);
  });
}

function aplicarMascaras(){
  const cep = document.getElementById("cep");
  cep?.addEventListener("input", () => cep.value = formatarCEP(cep.value));
  cep?.addEventListener("blur", buscarCEP);

  const cnpj = document.getElementById("cnpj");
  cnpj?.addEventListener("input", () => cnpj.value = formatarCNPJ(cnpj.value));
  cnpj?.addEventListener("blur", buscarCNPJ);

  aplicarMascaraMoeda(document.getElementById("valorPerCapita"));
  aplicarMascaraMoeda(document.getElementById("ultimaFatura"));

  ["ultimoReajuste","participacaoFuncionarios"].forEach(id=>{
    const el = document.getElementById(id);
    el?.addEventListener("input", () => {
      el.value = formatarPercentual(el.value);
    });
  });

  produtosConfig.forEach(p=>{
    faixas.forEach((_,i)=>aplicarMascaraMoeda(document.getElementById(`${p.id}_${i}`)));
    aplicarMascaraMoeda(document.getElementById(`${p.id}_linear_valor`));
    const vidas = document.getElementById(`${p.id}_linear_vidas`);
    vidas?.addEventListener("input", () => vidas.value = somenteDigitos(vidas.value));
  });
}
aplicarMascaras();


function toggleQtd(selectId, inputId){
  const select = document.getElementById(selectId);
  const input = document.getElementById(inputId);
  if(!select || !input) return;

  const ativo = select.value === "sim";
  input.disabled = !ativo;
  if(!ativo) input.value = "";

  const box = document.querySelector(`[data-qtd-for="${selectId}"]`);
  if(box) box.classList.toggle("qtd-active", ativo);
}

function inicializarPerguntasAdicionais(){
  [["afastamento","qtdAfastamento"],["partoProgramado","qtdParto"],["obesidade","qtdObesidade"],["homeCare","qtdHomeCare"]].forEach(([s,i])=>{
    toggleQtd(s,i);
    const input = document.getElementById(i);
    input?.addEventListener("input", () => input.value = somenteDigitos(input.value));
  });
}
document.addEventListener("DOMContentLoaded", inicializarPerguntasAdicionais);

function alternarModeloValores(){
  const modo = $("modeloValores");
  document.getElementById("produtos").classList.toggle("hidden", modo === "linear");
  document.getElementById("produtosLineares").classList.toggle("hidden", modo !== "linear");
  document.querySelector(".faixa-hint").classList.toggle("hidden", modo === "linear");
  document.querySelector(".linear-hint").classList.toggle("hidden", modo !== "linear");
}
alternarModeloValores();

function limparFormulario(){
  document.querySelectorAll("input, textarea").forEach(el=>{
    if(el.id === "cidade") el.value = "BRASÍLIA";
    else if(el.id.endsWith("_titulo")){
      const p = produtosConfig.find(p=>`${p.id}_titulo` === el.id);
      el.value = p ? p.titulo : "";
    }else if(el.id.endsWith("_linear_produto")){
      const p = produtosConfig.find(p=>`${p.id}_linear_produto` === el.id);
      el.value = p ? p.titulo : "";
    }else{
      el.value = "";
    }
  });
  document.querySelectorAll("select").forEach(el=>{
    if(el.id === "estado") el.value = "DF";
    else if(el.id === "modeloValores") el.value = "faixa";
    else el.value = "";
  });
  const status = document.getElementById("cepStatus");
  if(status){
    status.textContent = "";
    status.className = "";
  }

  const cnpjStatus = document.getElementById("cnpjStatus");
  if(cnpjStatus){
    cnpjStatus.textContent = "";
    cnpjStatus.className = "";
  }
  alternarModeloValores();
  inicializarPerguntasAdicionais();
}


function produtoTemValor(id){
  return faixas.some((_,i)=>$(`${id}_${i}`));
}

function produtoDados(id){
  return {
    titulo: $(`${id}_titulo`),
    valores: faixas.map((_,i)=>$(`${id}_${i}`))
  };
}

function formatarValor(v){
  if(!v) return "";
  v = String(v).trim();
  return /^R\$/i.test(v) ? v : "R$ " + v;
}

function quebrar(texto, maxChars){
  const words = String(texto || "").split(/\s+/).filter(Boolean);
  const out = [];
  let line = "";
  for(const w of words){
    const next = (line + " " + w).trim();
    if(next.length > maxChars && line){
      out.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if(line) out.push(line);
  return out;
}

function textoAjustado(doc, txt, x, y, maxW, size=7.8, bold=false){
  if(!txt) return;
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  let t = String(txt);
  while(doc.getTextWidth(t) > maxW && t.length > 3){
    t = t.slice(0,-1);
  }
  doc.text(t, x, y);
}

function textoMultilinha(doc, txt, x, y, maxChars, maxLines, size=7, lineH=3.2){
  if(!txt) return;
  doc.setFont("helvetica","normal");
  doc.setFontSize(size);
  quebrar(txt,maxChars).slice(0,maxLines).forEach((linha,i)=>doc.text(linha,x,y+i*lineH));
}

function caixa(doc, x, y, w, h){
  doc.rect(x,y,w,h);
}

function linha(doc, x1, y1, x2, y2){
  doc.line(x1,y1,x2,y2);
}

function rotuloValor(doc, label, value, x, y, w, h, labelW, opts={}){
  caixa(doc,x,y,w,h);
  if(labelW && labelW < w) linha(doc,x+labelW,y,x+labelW,y+h);
  doc.setFont("helvetica","bold");
  doc.setFontSize(opts.labelSize || 6.4);
  doc.text(label, x+1.2, y+4.6);
  if(value){
    textoAjustado(doc, value, x+(labelW || 0)+2, y+4.6, w-(labelW||0)-3, opts.valueSize || 7.4);
  }
}

function check(doc, selected, value, x, y){
  doc.setFont("helvetica","bold");
  doc.setFontSize(7);
  doc.text("(" , x, y);
  doc.text(")" , x+5, y);
  if(selected === value) doc.text("X", x+2.1, y);
}

function drawBase(doc){
  doc.setTextColor(0,0,0);
  doc.setDrawColor(0,0,0);
  doc.setLineWidth(0.25);
  doc.setFont("helvetica","normal");

  // logo
  doc.addImage("logo-header.png","PNG",71,7,68,27);

  // marca d'água aproximada
  try{
    const gs = new doc.GState({opacity:1});
    doc.setGState(gs);
    doc.addImage("watermark-gray.png","PNG",58,105,94,80);
    doc.setGState(new doc.GState({opacity:1}));
  }catch(e){}

  // footer
  doc.setTextColor(151,0,70);
  doc.setFontSize(9);
  doc.setFont("helvetica","normal");
  doc.text("evosaude.com.br", 105, 286.5, {align:"center"});
  doc.setFillColor(151,0,70);
  doc.rect(0,292,210,5,"F");
  doc.setTextColor(0,0,0);
}

function paginaFormulario(doc){
  drawBase(doc);

  const x = 17, w = 176;
  let y = 55;

  // Título do formulário
  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("QUESTIONÁRIO PARA COTAÇÃO EMPRESARIAL",105,46,{align:"center"});

  // Bloco identificação
  y = 55;
  // Cabeçalho de dados cadastrais redesenhado para manter os campos alinhados ao modelo
  rotuloValor(doc,"RAZÃO SOCIAL:",$("razaoSocial"),x,y,116,7,30);
  rotuloValor(doc,"CNPJ:",$("cnpj"),x+116,y,60,7,17); 
  y+=7;

  rotuloValor(doc,"CEP:",$("cep"),x,y,48,7,15);
  rotuloValor(doc,"CIDADE:",$("cidade"),x+48,y,66,7,18);
  rotuloValor(doc,"ESTADO:",$("estado"),x+114,y,62,7,18); 
  y+=7;

  rotuloValor(doc,"RESPONSÁVEL:",$("responsavel"),x,y,62,7,30);
  rotuloValor(doc,"CORRETORA:",$("corretora"),x+62,y,57,7,25);
  rotuloValor(doc,"VENDEDOR:",$("vendedor"),x+119,y,57,7,24); 
  y+=15;

  // Bloco contratação
  caixa(doc,x,y,w,7);
  doc.setFont("helvetica","bold"); doc.setFontSize(6.5);
  doc.text("CONTRATAÇÃO:",x+1.2,y+4.7);
  check(doc,$("contratacao"),"compulsorio",x+31,y+4.7);
  doc.text("COMPULSÓRIO",x+40,y+4.7);
  check(doc,$("contratacao"),"livre",x+86,y+4.7);
  doc.text("LIVRE ADESÃO",x+95,y+4.7);
  y+=7;

  caixa(doc,x,y,w,7);
  doc.text("MODALIDADE:",x+1.2,y+4.7);
  check(doc,$("modalidade"),"empresarial",x+31,y+4.7);
  doc.text("COL. EMPRESARIAL",x+40,y+4.7);
  check(doc,$("modalidade"),"adesao",x+86,y+4.7);
  doc.text("COL. POR ADESÃO",x+95,y+4.7);
  y+=14;

  // Bloco plano atual
  caixa(doc,x,y,w,7);
  doc.text("POSSUI PLANO DE SAÚDE?",x+1.2,y+4.7);
  check(doc,$("possuiPlano"),"sim",x+47,y+4.7); doc.text("SIM",x+56,y+4.7);
  check(doc,$("possuiPlano"),"nao",x+67,y+4.7); doc.text("NÃO",x+76,y+4.7);
  y+=7;

  rotuloValor(doc,"OPERADORA:",$("operadora"),x,y,58,7,25);
  rotuloValor(doc,"TEMPO DE CONTRATO:",$("tempoContrato"),x+58,y,58,7,43);
  rotuloValor(doc,"VALOR PER CAPITA:",$("valorPerCapita"),x+116,y,60,7,40); y+=7;

  rotuloValor(doc,"VIDAS ATIVAS:",$("vidasAtivas"),x,y,58,7,30);
  rotuloValor(doc,"VL. ÚLTIMA FATURA:",$("ultimaFatura"),x+58,y,58,7,38);
  rotuloValor(doc,"% DO ÚLTIMO REAJUSTE:",$("ultimoReajuste"),x+116,y,60,7,48); y+=7;

  caixa(doc,x,y,w,7);
  doc.text("ABRANGÊNCIA:",x+1.2,y+4.7);
  check(doc,$("abrangencia"),"municipal",x+29,y+4.7); doc.text("MUNICIPAL",x+38,y+4.7);
  check(doc,$("abrangencia"),"estadual",x+66,y+4.7); doc.text("ESTADUAL",x+75,y+4.7);
  check(doc,$("abrangencia"),"nacional",x+98,y+4.7); doc.text("NACIONAL",x+107,y+4.7);
  check(doc,$("abrangencia"),"regional",x+133,y+4.7); doc.text("REGIONAL",x+142,y+4.7);
  y+=7;

  rotuloValor(doc,"MOTIVO DA MUDANÇA:",$("motivoMudanca"),x,y,w,7,45); y+=7;
  rotuloValor(doc,"% PARTICIPAÇÃO FUNCIONÁRIOS:",$("participacaoFuncionarios"),x,y,91,7,62);
  rotuloValor(doc,"% PARTICIPAÇÃO EMPRESA: NÃO SE APLICA","",x+91,y,85,7,0); y+=7;

  caixa(doc,x,y,w,7);
  doc.text("FONTE PAGADORA:",x+1.2,y+4.7);
  textoAjustado(doc,$("fontePagadora"),x+35,y+4.7,55,6.5);
  linha(doc,x+91,y,x+91,y+7);
  doc.text("COBERTURA PARTO?",x+92.2,y+4.7);
  check(doc,$("coberturaParto"),"sim",x+131,y+4.7); doc.text("SIM",x+140,y+4.7);
  check(doc,$("coberturaParto"),"nao",x+151,y+4.7); doc.text("NÃO",x+160,y+4.7);
  y+=14;

  // Titulares
  const leftW = 118, rightW = 58, rowH = 7;
  const linhasTit = [
    ["OS TITULARES ACIMA POSSUEM VÍNCULO EMPREGATÍCIO OU ESTATUTÁRIO?","vinculo",null],
    ["TITULARES EM AFASTAMENTO POR MOTIVO DE SAÚDE","afastamento","qtdAfastamento"],
    ["TITULARES COM PARTO PROGRAMADO","partoProgramado","qtdParto"],
    ["TITULARES EM ACOMPANHAMENTO DE OBESIDADE MÓRBIDA","obesidade","qtdObesidade"],
    ["TITULARES EM TRATAMENTO DOMICILIAR (HOME CARE)?","homeCare","qtdHomeCare"],
  ];
  linhasTit.forEach((r,idx)=>{
    caixa(doc,x,y,w,rowH);
    linha(doc,x+leftW,y,x+leftW,y+rowH);
    doc.text(r[0],x+1.2,y+4.7);
    const resposta = $(r[1]) || "nao";

    if(idx===0){
      // Caso não seja selecionado, preencher automaticamente como NÃO
      check(doc,resposta,"sim",x+146,y+4.7); doc.text("SIM",x+155,y+4.7);
      check(doc,resposta,"nao",x+122,y+4.7); doc.text("NÃO",x+131,y+4.7);
    }else{
      // Caso não seja selecionado, preencher automaticamente como NÃO
      check(doc,resposta,"nao",x+122,y+4.7); doc.text("NÃO",x+131,y+4.7);
      check(doc,resposta,"sim",x+146,y+4.7);

      if(resposta==="sim"){
        // Texto compacto com quantidade dentro da célula
        doc.setFont("helvetica","bold");
        doc.setFontSize(5.8);
        doc.text("SIM Q:" + String($(r[2]) || ""), x+154, y+4.7);
      } else {
        doc.text("SIM",x+155,y+4.7);
      }
    }
    y+=rowH;
  });

  y+=7;
  doc.setFont("helvetica","bold"); doc.setFontSize(6.8);
  doc.text("PERGUNTAS ADICIONAIS:",x,y); y+=5;

  doc.text("CIDS DOS AFASTADOS E CASOS CRÔNICOS.",x,y); y+=2;
  caixa(doc,x,y,w,5);
  textoMultilinha(doc,$("cids"),x+1.5,y+3.5,125,1,6.4,3); y+=11;

  doc.text("DISTRIBUIÇÃO DAS VIDAS POR UF.",x,y); y+=2;
  caixa(doc,x,y,w,12);
  textoMultilinha(doc,$("distribuicaoUf"),x+1.5,y+4,125,3,6.4,3.2); y+=18;

  doc.text("SINISTRALIDADE DOS ÚLTIMOS 2 ANOS, SE JÁ HOUVER EXPERIÊNCIA.",x,y); y+=2;
  caixa(doc,x,y,w,5);
  textoMultilinha(doc,$("sinistralidade"),x+1.5,y+3.5,125,1,6.4,3); y+=11;

  doc.text("HÁ POSSIBILIDADE DE ENTREVISTA MÉDICA DOS CASOS CRÔNICOS?",x,y); y+=2;
  caixa(doc,x,y,w,5);
  textoMultilinha(doc,$("entrevistaMedica"),x+1.5,y+3.5,125,1,6.4,3);
}

function drawCentered(doc, text, x, y, w, size, bold=true){
  doc.setFont("helvetica",bold ? "bold" : "normal");
  doc.setFontSize(size);
  const tw = doc.getTextWidth(text);
  doc.text(text, x + (w - tw)/2, y);
}

function tabelaProduto(doc, produto, x, y, w, cfg){
  const titleH = cfg.titleH, headerH = cfg.headerH, rowH = cfg.rowH;
  const leftW = w/2, h = titleH + headerH + rowH*10;

  doc.setDrawColor(0,0,0);
  doc.setLineWidth(0.25);
  doc.rect(x,y,w,h);

  doc.line(x,y+titleH,x+w,y+titleH);
  doc.setFillColor(151,0,70);
  doc.rect(x,y+titleH,w,headerH,"F");
  doc.rect(x,y+titleH,w,headerH);
  doc.line(x+leftW,y+titleH,x+leftW,y+h);

  for(let i=0;i<=10;i++){
    const yy = y + titleH + headerH + rowH*i;
    doc.line(x,yy,x+w,yy);
  }

  const titulo = produto.titulo || "PLANO:";

  if(titleH <= 10){
    // Título compacto em uma linha para evitar sobreposição com o cabeçalho da tabela
    let t = titulo;
    doc.setFont("helvetica","bold");
    doc.setFontSize(cfg.titleSize);
    while(doc.getTextWidth(t) > w - 4 && t.length > 6){
      t = t.slice(0, -1);
    }
    drawCentered(doc,t,x,y+cfg.titleY,w,cfg.titleSize,true);
  }else{
    const titLines = quebrar(titulo,cfg.titleChars).slice(0,2);
    const lineGap = Math.min(cfg.titleSize + 0.8, 6.8);
    titLines.forEach((l,i)=>drawCentered(doc,l,x,y+cfg.titleY+i*lineGap,w,cfg.titleSize,true));
  }

  doc.setTextColor(255,255,255);
  drawCentered(doc,"FAIXA ETÁRIA",x,y+titleH+cfg.headerY,leftW,cfg.headerSize,true);
  drawCentered(doc,"Valor",x+leftW,y+titleH+cfg.headerY,leftW,cfg.headerSize,true);
  doc.setTextColor(0,0,0);

  faixas.forEach((f,i)=>{
    const yy = y + titleH + headerH + rowH*i + cfg.rowY;
    drawCentered(doc,f,x,yy,leftW,cfg.rowSize,true);
    drawCentered(doc,formatarValor(produto.valores[i]),x+leftW,yy,leftW,cfg.rowSize,true);
  });
}


function linearTemValor(id){
  return $(`${id}_linear_valor`) || $(`${id}_linear_vidas`) || $(`${id}_linear_produto`);
}

function linearDados(id){
  return {
    produto: $(`${id}_linear_produto`),
    vidas: $(`${id}_linear_vidas`),
    valor: $(`${id}_linear_valor`)
  };
}

function tabelaLinear(doc, item, x, y, w, rowH, fontSize){
  const colProduto = w * 0.52;
  const colVidas = w * 0.22;
  const colValor = w - colProduto - colVidas;
  const h = rowH * 2;

  doc.setDrawColor(0,0,0);
  doc.setLineWidth(0.25);
  doc.rect(x,y,w,h);
  doc.setFillColor(151,0,70);
  doc.rect(x,y,w,rowH,"F");
  doc.rect(x,y,w,rowH);

  doc.line(x+colProduto,y,x+colProduto,y+h);
  doc.line(x+colProduto+colVidas,y,x+colProduto+colVidas,y+h);
  doc.line(x,y+rowH,x+w,y+rowH);

  doc.setTextColor(255,255,255);
  drawCentered(doc,"PRODUTO",x,y+rowH-2.7,colProduto,fontSize,true);
  drawCentered(doc,"VIDAS",x+colProduto,y+rowH-2.7,colVidas,fontSize,true);
  drawCentered(doc,"PREÇO LINEAR",x+colProduto+colVidas,y+rowH-2.7,colValor,fontSize,true);
  doc.setTextColor(0,0,0);

  const prod = item.produto || "";
  const lines = quebrar(prod, 42).slice(0,2);
  doc.setFont("helvetica","bold");
  doc.setFontSize(fontSize);
  lines.forEach((l,i)=>doc.text(l, x+2, y+rowH+4+(i*3.2)));
  drawCentered(doc,item.vidas || "",x+colProduto,y+rowH+5.2,colVidas,fontSize,true);
  drawCentered(doc,formatarValor(item.valor),x+colProduto+colVidas,y+rowH+5.2,colValor,fontSize,true);
}


const coparticipacaoLinhas = [
  ["APS / Atenção Primária", "Isento"],
  ["Consulta eletiva (por procedimento)", "R$ 20,00"],
  ["Pronto-socorro / emergência (por procedimento)", "R$ 40,00"],
  ["Exames Simples Laboratoriais (por procedimento)", "Até R$ 6,00"],
  ["Exames complementares (por procedimento)", "Até R$ 20,00"],
  ["Exames especiais / alta complexidade (por procedimento)", "Até R$ 60,00"],
  ["Terapias simples (por sessão)", "Até R$ 15,00"],
  ["Terapias multidisciplinares (por sessão)", "R$ 30,00"],
  ["Internações clínicas", "R$ 30,00"],
  ["Internações cirúrgicas", "R$ 150,00"]
];

function wrapTextByChars(text, maxChars){
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for(const word of words){
    const next = (line + " " + word).trim();
    if(next.length > maxChars && line){
      lines.push(line);
      line = word;
    }else{
      line = next;
    }
  }
  if(line) lines.push(line);
  return lines;
}

function tabelaCoparticipacao(doc, x, y, w){
  const leftW = w * 0.62;
  const rightW = w - leftW;
  const headerH = 10;
  const rowH = 9;

  doc.setDrawColor(0,0,0);
  doc.setLineWidth(0.25);
  doc.rect(x, y, w, headerH + (coparticipacaoLinhas.length * rowH));
  doc.line(x + leftW, y, x + leftW, y + headerH + (coparticipacaoLinhas.length * rowH));

  doc.setFont("helvetica","bold");
  doc.setFontSize(8);
  drawCentered(doc, "Procedimento", x, y + 6.8, leftW, 8, true);
  drawCentered(doc, "Coparticipação", x + leftW, y + 6.8, rightW, 8, true);

  doc.line(x, y + headerH, x + w, y + headerH);

  coparticipacaoLinhas.forEach((row, i) => {
    const yy = y + headerH + (i * rowH);
    doc.line(x, yy + rowH, x + w, yy + rowH);

    doc.setFont("helvetica","normal");
    doc.setFontSize(7.2);
    const procLines = wrapTextByChars(row[0], 42).slice(0,2);
    procLines.forEach((line, idx) => {
      doc.text(line, x + 2, yy + 4 + (idx * 3.2));
    });

    drawCentered(doc, row[1], x + leftW, yy + 5.7, rightW, 7.2, false);
  });
}

function paginaValoresLinear(doc){
  drawBase(doc);
  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("PROPOSTA DE VALORES",105,40,{align:"center"});

  const lista = [];
  produtosConfig.forEach((p)=>{
    const produto = document.getElementById(`${p.id}LinearProduto`)?.value || p.nome;
    const vidas = document.getElementById(`${p.id}LinearVidas`)?.value || "";
    const preco = document.getElementById(`${p.id}LinearValor`)?.value || "";
    if(produto || vidas || preco){
      lista.push({produto, vidas, preco});
    }
  });

  const x = 39, w = 132;
  let y = 72;

  lista.slice(0,3).forEach((item)=>{
    tabelaLinear(doc,item,x,y,w,9.5,6.8);
    y += 31;
  });

  doc.setFont("helvetica","bold");
  doc.setFontSize(7);
  doc.text("Validade da proposta: 30 dias.",65,230);
}

function paginaValores(doc){
  drawBase(doc);
  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("PROPOSTA DE VALORES",105,40,{align:"center"});

  const lista = [];
  produtosConfig.forEach((p)=>{
    if(produtoTemValor(p.id)) lista.push(produtoDados(p.id));
  });

  if(lista.length === 0){
    lista.push(produtoDados("one"));
  }

  if(lista.length === 1){
    tabelaProduto(doc, lista[0], 54, 58, 102, {
      titleH:17,
      headerH:9,
      rowH:7.2,
      titleSize:7.4,
      headerSize:7.1,
      rowSize:6.8,
      titleChars:46,
      titleY:6.5,
      headerY:6.2,
      rowY:5.2
    });

    doc.setFont("helvetica","bold");
    doc.setFontSize(7);
    doc.text("Validade da proposta: 30 dias.",65,207);

  }else if(lista.length === 2){
    const cfg = {
      titleH:18,
      headerH:8,
      rowH:5.7,
      titleSize:6.2,
      headerSize:6.5,
      rowSize:5.9,
      titleChars:48,
      titleY:6.8,
      headerY:5.6,
      rowY:4.3
    };

    tabelaProduto(doc, lista[0], 53, 48, 104, cfg);
    tabelaProduto(doc, lista[1], 53, 137, 104, cfg);

    doc.setFont("helvetica","bold");
    doc.setFontSize(7);
    doc.text("Validade da proposta: 30 dias.",65,231);

  }else{
    const cfg = {
      titleH:8,
      headerH:6,
      rowH:5.1,
      titleSize:5.6,
      headerSize:5.8,
      rowSize:5.6,
      titleChars:62,
      titleY:5.4,
      headerY:4.5,
      rowY:3.8
    };

    tabelaProduto(doc, lista[0], 53, 48, 104, cfg);
    tabelaProduto(doc, lista[1], 53, 116, 104, cfg);
    tabelaProduto(doc, lista[2], 53, 184, 104, cfg);

    doc.setFont("helvetica","bold");
    doc.setFontSize(6.7);
    doc.text("Validade da proposta: 30 dias.",65,259);
  }
}



function paginaCoparticipacao(doc){
  drawBase(doc);

  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("TABELA DE COPARTICIPAÇÃO",105,42,{align:"center"});

  tabelaCoparticipacao(doc, 24, 58, 162);

  doc.setFont("helvetica","bold");
  doc.setFontSize(7);
  doc.text("Validade da proposta: 30 dias.",24,250);
}

async function gerarPdfPropostaArrayBuffer(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({orientation:"portrait", unit:"mm", format:"a4", compress:true});
  paginaFormulario(doc);
  doc.addPage();
  if($("modeloValores") === "linear") paginaValoresLinear(doc); else paginaValores(doc);
  doc.addPage();
  paginaCoparticipacao(doc);
  return doc.output("arraybuffer");
}

async function anexarAoPdfBase(propostaBuffer){
  const basePath = "assets/PROPOSTA COMERCIAL 20.05.2026.pdf";

  const baseResponse = await fetch(basePath);
  if(!baseResponse.ok){
    throw new Error("PDF_BASE_NAO_ENCONTRADO");
  }

  const baseBytes = await baseResponse.arrayBuffer();
  const propostaBytes = propostaBuffer;

  const { PDFDocument } = window.PDFLib;
  const pdfBase = await PDFDocument.load(baseBytes);
  const pdfProposta = await PDFDocument.load(propostaBytes);

  const copiedPages = await pdfBase.copyPages(pdfProposta, pdfProposta.getPageIndices());
  copiedPages.forEach(page => pdfBase.addPage(page));

  return await pdfBase.save();
}


function limparNomeArquivo(texto){
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nomeArquivoFinal(){
  const razao = limparNomeArquivo($("razaoSocial"));
  return razao
    ? `Proposta Comercial - ${razao}.pdf`
    : "Proposta Comercial.pdf";
}


function baixarBlobPdf(bytes, filename){
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}


async function gerarPDF(){
  showLoading("Gerando PDF...");
  try{
    await new Promise(resolve => setTimeout(resolve, 250));

    const propostaBuffer = await gerarPdfPropostaArrayBuffer();
    const pdfFinal = await anexarAoPdfBase(propostaBuffer);

    hideLoading();
    baixarBlobPdf(pdfFinal, nomeArquivoFinal());
  }catch(error){
    hideLoading();
    console.error(error);

    if(error && error.message === "PDF_BASE_NAO_ENCONTRADO"){
      alert('Não encontrei o arquivo "PROPOSTA COMERCIAL 20.05.2026.pdf" dentro da pasta assets. Adicione o PDF base e tente novamente.');
      return;
    }

    alert("Não foi possível gerar o PDF final. Verifique se o PDF base está na pasta assets e tente novamente.");
  }
}
