# AgendaPet Web 🐾

[Projeto AgendaPet PauloLopes-Dev]

> 📋 **Quadro Kanban:** [https://trello.com/invite/b/6a69398567952a6b70ce8236/ATTI907c3ce7d474867ea681309028aec857654F20AA/sctec-agendapet-web-painel-de-agendamentos]
> 🌐 **GitHub Pages (opcional/bônus):** [link, se publicou]

## 1. O que o sistema faz e para quem serve

[Explique com suas palavras. Inclua um print da tela, por exemplo `![Tela](docs/tela-1280.png)`.]
q

## 2. Como executar (do zero)

**Pré-requisitos:** Node.js e Git instalados.

### Instalação

Clone o repositório e acesse a pasta do projeto:

```bash
git clone [url-do-seu-repositorio]
cd AgendaPet-Web-SCTEC
```

Instale as dependências locais:

```bash
npm install
```

### Executar o sistema

```bash
npm start
```

O servidor local será iniciado na porta **5502**. Acesse:

`http://localhost:5502`

### Comandos disponíveis

| Comando                                          | O que faz                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `npm start`                                      | Inicia o servidor HTTP local na porta 5502.                                                     |
| `npm run fechamento -- 2026-11-04`               | Gera o relatório de fechamento diário para a data informada, usando `data/agenda-exemplo.json`. |
| `npm run validar`                                | Valida os agendamentos de `data/agenda-exemplo.json`.                                           |
| `npm run validar -- ./data/agenda-invalida.json` | Valida outro arquivo JSON, permitindo testar registros inválidos.                               |
| `npm test`                                       | Executa os testes automatizados do projeto.                                                     |

**Observação:** o fechamento diário considera os atendimentos concluídos para calcular o faturamento.

## 3. Decisões de negócio

| Decisão                       | Valor / Regra                                                                    | Onde está no código                               |
| ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| Horário de funcionamento      | 08:00 às 18:00, intervalos de 30 minutos                                         | `js/dominio/agendamento.js`: `CONFIG`             |
| Conflito de horário           | Não permite dois agendamentos ativos na mesma data e horário                     | `js/dominio/agendamento.js`: `conflitaCom()`      |
| Cancelamento                  | Agendamento cancelado deixa de ser considerado ativo                             | `js/dominio/agendamento.js`: `get ativo()`        |
| Taxa domiciliar               | R$ 20,00 fora de Joinville; sem taxa em Joinville                                | `js/dominio/agendamento.js`: `taxaDeslocamento()` |
| Faturamento                   | Soma somente os atendimentos concluídos, incluindo eventual taxa de deslocamento | `js/dominio/fechamento.js`: `fecharDia()`         |
| Validade do cache de feriados | A confirmar no código da API                                                     | `js/api.js`                                       |
| Quando as APIs falham         | A confirmar no código de tratamento de erros                                     | `js/api.js`                                       |

## 4. Conceitos do Módulo 01: onde foram aplicados

| Conceito                                 | Arquivo e função                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| HTML semântico, acessibilidade e SEO     | `index.html`: estrutura semântica, títulos e acessibilidade.                                                                 |
| Formulários + JavaScript                 | `index.html` e `js/app.js`: captura e validação dos dados.                                                                   |
| CSS, Flexbox, variáveis e responsividade | `css/style.css`: layout, variáveis e adaptação de telas.                                                                     |
| DOM e seletores                          | `js/app.js` e `js/ui.js`: seleção e atualização de elementos.                                                                |
| Eventos de mouse e teclado               | `js/app.js`: eventos de interação com a interface.                                                                           |
| `fetch`, Promises e `async/await`        | `js/api.js`: comunicação com APIs externas.                                                                                  |
| `localStorage`                           | `js/storage.js`: persistência dos dados no navegador.                                                                        |
| `setTimeout` / `setInterval`             | `js/app.js`: notificações e atualização periódica.                                                                           |
| Classes, construtor e `this`             | `js/dominio/agendamento.js`: classes de agendamento.                                                                         |
| Herança (`extends`/`super`)              | `js/dominio/agendamento.js`: herança de `Agendamento`.                                                                       |
| Closure                                  | `js/dominio/agendamento.js`: contador privado de protocolos.                                                                 |
| Callback                                 | Funções de tratamento de eventos e operações assíncronas.                                                                    |
| Métodos de array e laços                 | `js/dominio/fechamento.js`: `filter`, `reduce`, `sort`, `find` e `for...of`.                                                 |
| `const`, `let` e `var`                   | `const` evita reatribuição; `let` permite reatribuição. Evitamos `var` por seu escopo de função e comportamento de hoisting. |
| Módulos ESM                              | Arquivos JavaScript: utilização de `import` e `export`.                                                                      |
| Node.js, npm e CommonJS                  | `package.json` e arquivos `.cjs` da pasta `scripts/`.                                                                        |

## 5. Arquitetura cliente-servidor

O AgendaPet Web utiliza uma arquitetura web em que o navegador executa a aplicação e um servidor HTTP local disponibiliza os arquivos HTML, CSS, JavaScript e JSON.

### Organização da aplicação

- **index.html:** estrutura semântica da página e carregamento dos scripts.
- **css/style.css:** estilos e apresentação visual.
- **js/app.js:** módulo principal, responsável por integrar os recursos do sistema.
- **js/ui.js:** criação e atualização dos elementos da interface.
- **js/api.js:** comunicação com serviços externos por meio de `fetch`.
- **js/storage.js:** leitura, gravação e limpeza de dados no `localStorage`.
- **js/dominio/:** regras de negócio, agendamentos, conflitos e fechamento diário.
- **data/:** arquivos JSON com dados de serviços e agendas de exemplo.

### Comunicação e armazenamento

O navegador carrega os arquivos disponibilizados pelo servidor HTTP local. A aplicação consulta arquivos JSON locais e serviços externos, como ViaCEP e BrasilAPI, utilizando requisições assíncronas com `fetch` e `async/await`.

Os dados persistidos pelo sistema são armazenados no `localStorage` do navegador. O cache de feriados possui validade de 30 dias.

### Fluxo simplificado

1. O navegador solicita o `index.html` ao servidor local.
2. O HTML carrega os estilos e o módulo `js/app.js`.
3. O módulo principal importa os demais módulos JavaScript.
4. A aplicação carrega os serviços e consulta as APIs necessárias.
5. As regras de negócio processam os agendamentos.
6. A interface é atualizada e os dados são persistidos localmente.

## 6. Gerenciadores de pacotes: instalação global vs local

O projeto utiliza o npm para gerenciar suas dependências.

**Instalação local**

O `http-server` foi instalado como dependência de desenvolvimento do projeto:

```bash
npm install --save-dev http-server
```

Essa instalação registra a dependência no `package.json` e no `package-lock.json`. Para instalar as dependências ao clonar o projeto, utiliza-se:

```bash
npm install
```

**Instalação global**

Uma ferramenta pode ser instalada globalmente para ser utilizada em diferentes projetos:

```bash
npm install -g http-server
```

Essa instalação é opcional no AgendaPet, pois o servidor já está declarado nas dependências locais.

**Comandos úteis:**

```bash
npm ls
npm ls -g --depth=0
npx http-server
```

- `npm ls`: lista as dependências locais.
- `npm ls -g --depth=0`: lista os pacotes globais instalados.
- `npx`: executa ferramentas disponíveis localmente ou obtidas pelo npm.

## 7. CommonJS vs ESM

| Característica             | CommonJS                       | ESM                                               |
| -------------------------- | ------------------------------ | ------------------------------------------------- |
| Sintaxe                    | `require()` e `module.exports` | `import` e `export`                               |
| Extensão                   | `.cjs`                         | `.js` ou `.mjs`                                   |
| `"type"` no `package.json` | `.cjs` mantém CommonJS         | `"type": "module"` define ESM para arquivos `.js` |
| Carregamento               | Sistema tradicional do Node.js | Sistema de módulos padrão do JavaScript           |
| Funciona no navegador?     | Não diretamente                | Sim, com `type="module"`                          |

**Por que o AgendaPet utiliza ESM?**

O projeto utiliza ESM como padrão porque permite organizar o código em módulos com `import` e `export`, facilitando a separação das responsabilidades e o reaproveitamento de funções.

O arquivo `package.json` contém `"type": "module"`, fazendo com que os arquivos `.js` sejam interpretados como módulos ES.

O validador `scripts/validar-agenda.cjs` utiliza CommonJS porque essa foi a abordagem adotada para demonstrar os dois sistemas de módulos no projeto. A extensão `.cjs` permite utilizar `require()` mesmo com o projeto configurado para ESM.

## 8. Especificidade no CSS: um conflito real

Durante o desenvolvimento, foi identificado um conflito entre a propriedade `display` dos elementos e o atributo HTML `hidden`.

Algumas regras de estilo definiam a exibição dos elementos, o que poderia fazer com que um campo marcado com `hidden` continuasse aparecendo na tela.

**Solução adotada:**

Foi criada uma regra CSS específica para respeitar o atributo `hidden`:

```css
[hidden] {
  display: none;
}
```

### 8.1. Responsividade e testes de tela

O projeto utiliza abordagem mobile-first e Flexbox como base do layout.

Breakpoints utilizados:

| Largura mínima | Aplicação                          |
| -------------- | ---------------------------------- |
| 640px          | Ajustes para telas intermediárias  |
| 1024px         | Layout ampliado para telas maiores |

Resultados dos testes no Chrome DevTools:

| Largura da tela | Largura do documento | Rolagem horizontal |
| --------------: | -------------------: | ------------------ |
|           360px |                360px | Não                |
|           768px |                768px | Não                |
|          1280px |               1280px | Não                |

Todos os três tamanhos foram aprovados, sem rolagem horizontal.

As cores, os espaçamentos e a tipografia são organizados por variáveis CSS declaradas em `:root`, com ajustes para o tema escuro.

## 9. Depuração

[Resumo do bug e link para [docs/bug-report.md](docs/bug-report.md). Inclua o print `docs/depuracao.png`.]

## 10. Sprint: planejado × entregue

| Indicador                   | Resultado       |
| --------------------------- | --------------- |
| Histórias planejadas        | 12              |
| Histórias integradas        | 10              |
| Histórias em andamento      | US11 e US12     |
| Pontos planejados           | Não recuperados |
| Pontos entregues            | Não registrados |
| Pull Requests de integração | 7               |

### Entregas

- **US01–US03:** estrutura inicial, formulário, validações e persistência.
- **US04–US06:** atendimento domiciliar, consulta de CEP, alertas de feriados e melhorias na agenda.
- **US07–US10:** regras de negócio, fechamento diário, lembretes, exportação, limpeza de dados e responsividade.
- **US11:** scripts Node.js para fechamento diário e validação da agenda.
- **US12:** depuração, evidências e relatório de bug.

### Retrospectiva

- **O que manter:** desenvolvimento incremental, commits por etapa e integração por Pull Requests.
- **O que parar de fazer:** deixar documentação e evidências para o final.
- **O que começar a fazer:** registrar estimativas, resultados dos testes e evidências durante cada história.

### Retrospectiva

- **O que manter:** [ ]
- **O que parar de fazer:** [ ]
- **O que começar a fazer:** [ ]

## 11. Extensões do VS Code

As extensões utilizadas para apoiar o desenvolvimento do AgendaPet Web foram:

| Extensão                  | Finalidade                                                         |
| ------------------------- | ------------------------------------------------------------------ |
| HTML CSS Support          | Autocompletar e auxiliar na edição de HTML e CSS.                  |
| Prettier                  | Formatação automática do código.                                   |
| Auto Rename Tag           | Renomear simultaneamente tags HTML de abertura e fechamento.       |
| Color Highlight           | Visualizar cores diretamente no código CSS.                        |
| CSS Peek                  | Localizar definições de classes e identificadores CSS.             |
| Live Server               | Executar o projeto em um servidor local durante o desenvolvimento. |
| PDF Viewer                | Visualizar arquivos PDF no VS Code.                                |
| vscode-icons              | Identificar tipos de arquivos e pastas por ícones.                 |
| HTML CSS Class Completion | Autocompletar classes CSS nos arquivos HTML.                       |

## 12. Estrutura do projeto

```text
AgendaPet-Web-SCTEC/
├── .github/
│   └── pull_request_template.md
├── .vscode/
│   ├── launch.json
│   └── settings.json
├── css/
│   └── style.css
├── data/
│   ├── agenda-exemplo.json
│   ├── agenda-invalida.json
│   └── servicos.json
├── docs/
│   ├── bug-report.md
│   ├── depuracao.png
│   └── kamban.png
├── img/
│   ├── favicon.svg
│   └── logo.svg
├── js/
│   ├── api.js
│   ├── app.js
│   ├── storage.js
│   ├── ui.js
│   └── dominio/
│       ├── agendamento.js
│       ├── fechamento.js
│       └── regras.js
├── planejamento/
├── scripts/
│   ├── fechamento.js
│   ├── validar-agenda.cjs
│
├── tests/
│   └── dominio.test.js
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

A pasta `node_modules/` foi omitida por conter dependências instaladas localmente. Ela não deve ser enviada ao repositório.

## 13. Uso de IA

## 13. Uso de IA

A inteligência artificial foi utilizada como ferramenta de apoio durante o desenvolvimento do AgendaPet Web.

Principais aplicações:

- **Planejamento:** apoio na organização das histórias de usuário e etapas de desenvolvimento.
- **Programação:** orientação na implementação de funcionalidades em JavaScript, HTML e CSS.
- **Depuração:** auxílio na identificação de erros, análise de mensagens do console e compreensão do funcionamento do código.
- **Git e GitHub:** orientação sobre branches, commits, merges e Pull Requests.
- **Testes:** apoio na elaboração e revisão de cenários de validação.
- **Documentação:** auxílio na organização e revisão do README e dos registros do projeto.

As sugestões geradas pela IA foram analisadas e aplicadas de forma incremental. Os resultados foram conferidos por meio da execução do sistema, testes automatizados, validações no terminal e inspeção dos arquivos.

A IA foi utilizada apenas como apoio ao aprendizado e ao desenvolvimento.
