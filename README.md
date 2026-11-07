# AgendaPet Web 🐾

[Projeto AgendaPet PauloLopes-Dev]

> 📋 **Quadro Kanban:** [https://trello.com/invite/b/6a69398567952a6b70ce8236/ATTI907c3ce7d474867ea681309028aec857654F20AA/sctec-agendapet-web-painel-de-agendamentos]
> 🌐 **GitHub Pages (opcional/bônus):** [link, se publicou]

## 1. O que o sistema faz e para quem serve

[Explique com suas palavras. Inclua um print da tela, por exemplo `![Tela](docs/tela-1280.png)`.]

## 2. Como executar (do zero)

Pré-requisitos: Node.js [versão] e Git.

```bash
git clone [url-do-seu-repositorio]
cd [pasta]
npm install
npm start
```

| Comando              | O que faz  |
| -------------------- | ---------- |
| `npm start`          | [descreva] |
| `npm run fechamento` | [descreva] |
| `npm run validar`    | [descreva] |

## 3. Decisões de negócio

| Decisão                       | Valor                           | Onde está no código |
| ----------------------------- | ------------------------------- | ------------------- |
| Horário de funcionamento      | [ex.: 08:00 às 18:00]           | [arquivo/função]    |
| Conflito de horário           | [regra]                         | [arquivo/função]    |
| Taxa domiciliar               | [valor e regra]                 | [arquivo/função]    |
| Faturamento                   | [o que entra e o que não entra] | [arquivo/função]    |
| Validade do cache de feriados | [ex.: 30 dias]                  | [arquivo/função]    |
| Quando as APIs falham         | [o que acontece]                | [arquivo/função]    |

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

[Explique o que é e como aparece no projeto: navegador, servidor local, `servicos.json`, ViaCEP e BrasilAPI. Um diagrama simples em texto ajuda.]

## 6. Gerenciadores de pacotes: instalação global vs local

[Quando usar cada uma, o que você instalou e onde. Mostre os comandos: `npm install -g`, `npm install --save-dev`, `npm ls`, `npm ls -g --depth=0`, `npx`.]

## 7. CommonJS vs ESM

|                            | CommonJS | ESM |
| -------------------------- | -------- | --- |
| Sintaxe                    | [ ]      | [ ] |
| Extensão                   | [ ]      | [ ] |
| `"type"` no `package.json` | [ ]      | [ ] |
| Carregamento               | [ ]      | [ ] |
| Funciona no navegador?     | [ ]      | [ ] |

[Por que o projeto usa ESM?]

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

| | |
| ----------------------------- | ------------ |q
| Tickets planejados | [ ] |
| Pontos planejados | [ ] |
| Pontos entregues | [ ] |
| O que ficou de fora e por quê | [ ] |
| Branches / Pull Requests | [quantidade] |

Detalhes em [planejamento/sprint-planning.md](planejamento/sprint-planning.md).

### Retrospectiva

- **O que manter:** [ ]
- **O que parar de fazer:** [ ]
- **O que começar a fazer:** [ ]

## 11. Extensões do VS Code

[Usadas ou recomendadas: Live Server, ESLint, Prettier, GitLens, etc.]

## 12. Estrutura do projeto

```
[cole aqui a árvore de pastas do seu projeto]
```

## 13. Uso de IA

[Se usou, diga onde e o que você validou. Se não usou, escreva "Não utilizei".]
