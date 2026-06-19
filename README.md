# Gerador de Propostas Comerciais - EVO Saúde

Uma aplicação Web *Single Page Application* (SPA) focada na automação e geração de propostas comerciais no formato PDF para a equipe comercial da EVO Saúde.

## 🎯 Objetivo
Transformar a experiência de vendas de planos de saúde, permitindo que o corretor preencha dados cadastrais, defina o modelo regional (Padrão ou Uberaba), valide o questionário de risco e gere, num único clique, um PDF comercial híbrido (que funde as páginas geradas dinamicamente com os materiais institucionais da marca). Tudo isto processado exclusivamente no lado do cliente (*Client-side*).

## ✨ Funcionalidades Principais
* **Preenchimento Automático via API:** Integração com a *BrasilAPI* para consulta do CNPJ (retornando Razão Social, CEP, UF, etc.) e com a API do *ViaCEP*.
* **Cálculo e Renderização Dinâmica:** Dependendo do modelo selecionado (Uberaba ou Padrão), a aplicação exibe opções distintas de produtos e de tabelas de comparticipação, formatando automaticamente os valores monetários.
* **Questionário de Risco Inteligente:** Atribuição dinâmica de campos numéricos (ex: Quantidade de pessoas com obesidade ou afastamento) apenas quando a resposta ao questionário é afirmativa.
* **Geração Vetorial de PDF (jsPDF):** Desenho programático (em coordenadas `X/Y`) de formulários, caixas de seleção, descrições de produtos e valores. 
* **Mesclagem de Ficheiros (pdf-lib):** Capacidade de anexar as páginas preenchidas a um PDF institucional de fundo, criando um documento polido e profissional pronto para o cliente.
* **Persistência de Dados e Histórico:** Armazenamento no `localStorage` do navegador, criando *snapshots* do formulário. Permite que o utilizador edite propostas antigas e exporte o seu histórico para `.csv`.
* **Modo Escuro (Dark Mode):** Suporte nativo a um tema claro e escuro para melhor ergonomia visual, mantendo as diretrizes da marca da EVO Saúde.

## 🛠 Arquitetura e Stack Tecnológico
A aplicação foi construída visando ser leve, rápida e isenta da necessidade de uma infraestrutura de *back-end* (servidor).
- **HTML5 & CSS3:** Semântica web e folhas de estilo modernas com *Custom Properties* (Variáveis) para o controlo da identidade visual ("Premium UI").
- **JavaScript Vanilla (ES6+):** Motor lógico da aplicação, manipulando o DOM, APIs e ficheiros.
- **jsPDF:** Biblioteca base para criação programática do PDF de dados.
- **pdf-lib:** Biblioteca avançada que permite o *merge* (fusão) dos PDFs criados com os PDFs estáticos do diretório de *assets*.

## 📁 Estrutura de Ficheiros
```
/
├── index.html                           # Interface estrutural principal
├── style.css                            # Folha de estilos (Variáveis, Animações, Dark Mode)
├── script.js                            # Cérebro da aplicação (APIs, jsPDF, pdf-lib, Lógica)
└── /assets                              # Ficheiros de recursos estáticos
    ├── logo.png                         # Logotipo primário
    ├── logo-header.png                  # Logotipo secundário
    ├── watermark-gray.png               # Marca de água para o PDF
    ├── PROPOSTA COMERCIAL.pdf           # Ficheiro PDF base de marketing (Padrão)
    ├── PROPOSTA COMERCIAL UBERABA.pdf   # Ficheiro PDF base de marketing (Uberaba)
    └── PROPOSTA COMERCIAL tela final.pdf# Página final de encerramento do PDF
```

## 🚀 Como Executar o Projeto
Uma vez que o projeto corre a 100% no *browser* do cliente, basta realizar os seguintes passos:
1. Extrair os ficheiros para uma pasta local.
2. É estritamente recomendado usar um servidor local simples (como o **Live Server** no VSCode ou a extensão de Python `python -m http.server`) para evitar erros de CORS ao ler ficheiros estáticos locais (`.pdf`) pelo `pdf-lib`.
3. Abrir o `index.html` no navegador.
4. Preencher o formulário (teste colocar um CNPJ válido para ver o autopreenchimento).
5. Clicar em **Gerar Proposta**.

## 📝 Regras de Negócio e Cálculos
As tabelas de preços e os blocos de coparticipação são extraídos dos *arrays* de configuração definidos em `script.js` (`produtosPadraoConfig` e `produtosUberabaConfig`). Sempre que o corretor pressiona o botão *switch* de "Proposta Uberaba", o DOM é reconstruído para refletir apenas os planos disponíveis para essa região, e o documento base utilizado na compilação do PDF passa a ser o respetivo *asset* do Uberaba.

## ⚖️ Licença e Uso
Desenvolvido exclusivamente para a **EVO Saúde** como projeto de estudo, visando facilitar o processo interno das suas operações comerciais.
