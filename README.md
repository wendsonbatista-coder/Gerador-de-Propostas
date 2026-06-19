⚙️ Como Executar o Projeto
Como a aplicação foi construída utilizando arquitetura client-side pura (Vanilla JS), não é necessário instalar dependências ou configurar ambientes de execução complexos.

Transfira ou clone este repositório para a sua máquina local.

Certifique-se de que os PDFs base institucionais estão guardados dentro da diretoria correta especificada no código (ex: assets/).

Abra o ficheiro index.html diretamente em qualquer navegador moderno.

Recomendação: Para garantir o correto funcionamento das requisições assíncronas de ficheiros locais (PDFs base), execute o projeto utilizando um servidor local simples, como a extensão Live Server do VS Code ou o módulo nativo do Python:

Bash
python -m http.server 8000
Depois, aceda a http://localhost:8000 no seu navegador.

📄 Fluxo Técnico de Geração de PDF
O motor de compilação de documentos executa duas fases encadeadas de forma assíncrona:

Fase de Desenho (jsPDF): O script lê todos os inputs ativos do formulário e calcula as coordenadas X e Y numa folha A4 virtual. Tabelas, caixas de seleção e textos formatados são desenhados milimetricamente, gerando um ArrayBuffer binário em memória.

Fase de Injeção e Fusão (pdf-lib): O sistema descarrega o PDF de marketing correspondente ao modelo selecionado, carrega o buffer do jsPDF e realiza a cópia e anexação das páginas dinâmicas ao documento base. O utilizador recebe o ficheiro final unificado para transferência imediata.

🔏 Privacidade e Segurança
Por operar inteiramente no ecossistema do navegador do utilizador, nenhum dado comercial, cadastral ou financeiro é enviado para servidores externos. Toda a persistência é estritamente local (localStorage), garantindo conformidade nativa com as boas práticas de proteção de dados sensíveis corporativos.
"""

output_path = "README.md"
with open(output_path, "w", encoding="utf-8") as f:
f.write(readme_content)
