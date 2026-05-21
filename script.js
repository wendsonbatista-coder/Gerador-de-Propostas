const faixas = ["00 a 18","19 a 23","24 a 28","29 a 33","34 a 38","39 a 43","44 a 48","49 a 53","54 a 58","59 acima"];

const produtosConfig = [
  {id:"oneEnf", nome:"ONE ENF", titulo:"Plano ONE BSB CE - Enfermaria Regional com Coparticipação"},
  {id:"oneApt", nome:"ONE APT", titulo:"Plano ONE - APT Regional com Coparticipação"},
  {id:"evoNowEnf", nome:"EVO NOW ENF", titulo:"Plano EVO NOW - Enfermaria Regional com Coparticipação"},
  {id:"evoNowApt", nome:"EVO NOW APT", titulo:"Plano EVO NOW - APT Regional com Coparticipação"},
  {id:"nowEnf", nome:"NOW ENF", titulo:"Plano NOW - Enfermaria Regional com Coparticipação"},
  {id:"nowApt", nome:"NOW APT", titulo:"Plano NOW - APT Regional com Coparticipação"}
];


let totalResponsaveis = 0;
function adicionarResponsavel(nome=""){
  const area = document.getElementById("responsaveisArea");
  if(!area) return;
  area.innerHTML = "";
  totalResponsaveis = 1;

  const div = document.createElement("div");
  div.className = "responsavel-row responsavel-row-single";
  div.innerHTML = `
    <label>Responsável
      <input id="responsavelExtraNome0" value="${nome}" placeholder="Nome do responsável">
    </label>
  `;
  area.appendChild(div);
}
function coletarResponsaveis(){
  return Array.from(document.querySelectorAll(".responsavel-row")).map(row=>{
    const input = row.querySelector("input");
    return {nome:(input?.value||"").trim(), cargo:""};
  }).filter(r=>r.nome);
}
document.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("responsaveisArea")){
    adicionarResponsavel();
  }
});

function montarProdutos(){
  const area = document.getElementById("produtos");
  if(!area) return;
  area.innerHTML = "";

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
      </div>

      <div class="linear-inline linear-inline-simple">
        <h4>Valor linear</h4>
        <div class="grid linear-grid-one">
          <label>Valor linear do plano
            <input id="${p.id}_linear_valor" inputmode="numeric" placeholder="R$ 0,00">
          </label>
        </div>
        <input type="hidden" id="${p.id}_linear_produto" value="${p.titulo}">
        <input type="hidden" id="${p.id}_linear_vidas" value="">
      </div>`;
    area.appendChild(div);
  });
}
montarProdutos();

function montarProdutosLineares(){ return; }



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
  document.getElementById("produtos")?.classList.remove("hidden");
  document.getElementById("produtosLineares")?.classList.add("hidden");
  document.querySelector(".faixa-hint")?.classList.remove("hidden");
  document.querySelector(".linear-hint")?.classList.add("hidden");
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


function produtoTemValor(id){ return true; }

function produtoDados(id){
  return {
    titulo: $(`${id}_titulo`),
    valores: faixas.map((_,i)=>$(`${id}_${i}`))
  };
}


function produtoLinearDados(id){
  return {
    produto: $(`${id}_linear_produto`) || $(`${id}_titulo`),
    vidas: "",
    preco: $(`${id}_linear_valor`)
  };
}
function drawValorLinearResumo(doc, id, x, y, w, h=7.2){
  const d = produtoLinearDados(id);
  const labelW = w * 0.46;
  const valueW = w - labelW;

  doc.setDrawColor(0,0,0);
  doc.setLineWidth(0.25);
  doc.rect(x, y, w, h);
  doc.line(x + labelW, y, x + labelW, y + h);

  doc.setFillColor(151,0,70);
  doc.rect(x, y, labelW, h, "F");

  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold");
  doc.setFontSize(6.4);
  doc.text("VALOR LINEAR:", x + labelW/2, y + 4.8, {align:"center"});

  doc.setTextColor(0,0,0);
  doc.setFont("helvetica","bold");
  doc.setFontSize(6.3);
  let valor = d.preco || "";
  while(doc.getTextWidth(valor) > valueW - 4 && valor.length > 3){
    valor = valor.slice(0, -1);
  }
  doc.text(valor, x + labelW + 2, y + 4.8);
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
  doc.setFont("helvetica","bold");
  doc.setFontSize(12);
  doc.text("PROPOSTA COMERCIAL",105,46,{align:"center"});

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
    const lineGap = Math.min(cfg.titleSize + 0.45, 5.2);
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
  const leftW = w * 0.72;
  const rightW = w - leftW;
  const headerH = 8;

  const linhasPreparadas = coparticipacaoLinhas.map(row => {
    const procLines = wrapTextByChars(row[0], 48).slice(0,2);
    const h = procLines.length > 1 ? 10.5 : 8.2;
    return { row, procLines, h };
  });

  const totalH = headerH + linhasPreparadas.reduce((acc, item) => acc + item.h, 0);

  doc.setFillColor(151,0,70);
  doc.roundedRect(x, y, w, headerH, 2, 2, "F");

  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold");
  doc.setFontSize(8);
  doc.text("Procedimentos", x + 3, y + 5.4);
  doc.text("Valores", x + leftW + (rightW/2), y + 5.4, {align:"center"});

  doc.setTextColor(0,0,0);

  let yy = y + headerH;
  linhasPreparadas.forEach((item, i) => {
    if(i % 2 === 1){
      doc.setFillColor(222,222,222);
      doc.rect(x, yy, w, item.h, "F");
    }

    doc.setFont("helvetica","normal");
    doc.setFontSize(7.25);

    item.procLines.forEach((line, idx) => {
      doc.text(line, x + 3, yy + 4.6 + (idx * 3.2));
    });

    doc.text(item.row[1], x + leftW + (rightW/2), yy + (item.h/2) + 2, {align:"center"});
    yy += item.h;
  });

  doc.setDrawColor(151,0,70);
  doc.setLineWidth(1.2);
  doc.line(x, y + totalH + 3, x + w, y + totalH + 3);

  return totalH;
}


function paginaValoresLinear(doc){
  paginaValores(doc);
}



function paginaValores(doc){
  drawBase(doc);
  doc.setFont("helvetica","bold");
  doc.setFontSize(13);
  doc.text("PROPOSTA DE VALORES",105,39,{align:"center"});

  const lista = produtosConfig.map(p=>({id:p.id, ...produtoDados(p.id)}));

  const cfg = {
    titleH:8.8,
    headerH:6.7,
    rowH:3.95,
    titleSize:5.95,
    headerSize:6.0,
    rowSize:5.7,
    titleChars:48,
    titleY:5.55,
    headerY:4.95,
    rowY:3.35
  };

  const colW = 84;
  const leftX = 19;
  const rightX = 107;
  const rowsY = [45, 124, 203];

  lista.forEach((item,i)=>{
    const x = i % 2 === 0 ? leftX : rightX;
    const y = rowsY[Math.floor(i/2)];

    tabelaProduto(doc,item,x,y,colW,cfg);

    const tabelaAltura = cfg.titleH + cfg.headerH + (faixas.length * cfg.rowH);
    drawValorLinearResumo(doc,item.id,x,y + tabelaAltura + 1.1,colW,7.2);
  });

  // validade da proposta valores
  doc.setFont("helvetica","bold");
  doc.setFontSize(7.8);
  doc.setTextColor(151,0,70);
  doc.text("Validade da proposta: 30 dias.",184,283,{align:"left"});
  doc.setTextColor(0,0,0);
}





function paginaCoparticipacao(doc){
  drawBase(doc);

  doc.setFont("helvetica","bold");
  doc.setFontSize(13);
  doc.text("COPARTICIPAÇÃO",105,42,{align:"center"});

  const tabelaY = 56;
  const tabelaH = tabelaCoparticipacao(doc, 34, tabelaY, 142);

  // Bloco de observações visual mais limpo e sem sobreposição
  const obsX = 24;
  const obsY = tabelaY + tabelaH + 14;
  const obsW = 162;
  const obsH = 54;

  doc.setFillColor(248,248,248);
  doc.setDrawColor(151,0,70);
  doc.setLineWidth(0.35);
  doc.roundedRect(obsX, obsY, obsW, obsH, 2, 2, "FD");

  doc.setFillColor(151,0,70);
  doc.rect(obsX, obsY, 4, obsH, "F");

  doc.setTextColor(151,0,70);
  doc.setFont("helvetica","bold");
  doc.setFontSize(8.7);
  doc.text("OBSERVAÇÕES", obsX + 9, obsY + 8);

  doc.setDrawColor(151,0,70);
  doc.setLineWidth(0.25);
  doc.line(obsX + 9, obsY + 11, obsX + obsW - 8, obsY + 11);

  doc.setTextColor(0,0,0);
  doc.setFont("helvetica","normal");
  doc.setFontSize(8.5);

  const obs = `Esta proposta foi elaborada com base nas informações fornecidas pelo proponente, considerando, para fins de precificação, a inexistência de funcionários afastados por doença, demitidos, aposentados ou beneficiários portadores de doenças crônicas, em tratamento, em uso contínuo de medicamentos ou submetidos a terapias. Ressalta-se que a veracidade, integridade e atualização das informações prestadas são de inteira responsabilidade do proponente. Caso seja identificada qualquer omissão, divergência ou inconsistência — independentemente do momento ou motivo — os valores e as condições desta proposta poderão ser revistos, mediante nova análise e reprecificação, inclusive após o início de sua vigência.`;
  const obsLines = doc.splitTextToSize(obs, obsW - 18);
  doc.text(obsLines.slice(0, 10), obsX + 9, obsY + 17, {
    maxWidth: obsW - 18,
    lineHeightFactor: 1.12
  });

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR");
  const cidadeRaw = $("cidade") || "Brasília";
  const cidade = cidadeRaw
    ? cidadeRaw.charAt(0).toUpperCase() + cidadeRaw.slice(1).toLowerCase()
    : "Brasília";
  const estado = $("estado") || "DF";

  doc.setTextColor(0,0,0);
  doc.setFont("helvetica","normal");
  doc.setFontSize(7);

  doc.text("DATA", 28, 258);
  doc.line(28, 266, 80, 266);
  doc.text(`${cidade} - ${estado}, ${dataFormatada}.`, 28, 264);

  const responsaveis = coletarResponsaveis();
  const resp = responsaveis[0]?.nome || "";

  doc.text("RESPONSÁVEL", 128, 258);
  doc.line(128, 266, 180, 266);
  if(resp){
    doc.setFont("helvetica","bold");
    doc.text(resp, 154, 264, {align:"center"});
  }
}


async function gerarPdfPropostaArrayBuffer(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({orientation:"portrait", unit:"mm", format:"a4", compress:true});
  paginaFormulario(doc);
  doc.addPage();
  paginaValores(doc);
  doc.addPage();
  paginaCoparticipacao(doc);
  return doc.output("arraybuffer");
}

async function anexarAoPdfBase(propostaBuffer){
  const basePath = "assets/PROPOSTA COMERCIAL.pdf";
  const finalPath = "assets/PROPOSTA COMERCIAL tela final.pdf";

  const baseResponse = await fetch(basePath);
  if(!baseResponse.ok){
    throw new Error("PDF_BASE_NAO_ENCONTRADO");
  }

  const baseBytes = await baseResponse.arrayBuffer();

  const { PDFDocument } = window.PDFLib;
  const pdfBase = await PDFDocument.load(baseBytes);
  const pdfProposta = await PDFDocument.load(propostaBuffer);

  const propostaPages = await pdfBase.copyPages(pdfProposta, pdfProposta.getPageIndices());
  propostaPages.forEach(page => pdfBase.addPage(page));

  // Capa final opcional. Se o arquivo existir em assets, será anexado ao final.
  const finalResponse = await fetch(finalPath);
  if(finalResponse.ok){
    const finalBytes = await finalResponse.arrayBuffer();
    const pdfFinalPage = await PDFDocument.load(finalBytes);
    const finalPages = await pdfBase.copyPages(pdfFinalPage, pdfFinalPage.getPageIndices());
    finalPages.forEach(page => pdfBase.addPage(page));
  }

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
      alert('Não encontrei o arquivo "PROPOSTA COMERCIAL" dentro da pasta assets. Adicione o PDF base e tente novamente.');
      return;
    }

    alert("Não foi possível gerar o PDF final. Verifique se o PDF base está na pasta assets e tente novamente. A capa final deve estar como PROPOSTA COMERCIAL tela final.pdf.");
  }
}
