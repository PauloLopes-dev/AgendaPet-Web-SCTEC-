# Relatório de Depuração — Conflito de Agendamentos

**Projeto:** AgendaPet Web — Patinhas & Cia

**Data da análise:** 07/11/2026

**Tipo:** Erro controlado em dados de teste

**Arquivo analisado:** `data/agenda-invalida.json`

## 1. Descrição do problema

O arquivo de teste contém dois agendamentos ativos, AP-0001 e AP-0002, registrados para a mesma data e horário: 20/10/2026 às 08:00.

Essa situação viola a regra de negócio que impede dois atendimentos de ocuparem o mesmo horário.

Além do conflito, o arquivo contém outros dados inválidos utilizados para testar o validador.

## 2. Passos para reproduzir

1. Abrir o projeto AgendaPet Web no VS Code.
2. Abrir a configuração de depuração `AgendaPet - Depurar validador`.
3. Executar a depuração com F5.
4. Acompanhar a execução do arquivo `scripts/validar-agenda.cjs`.
5. Consultar a variável `erros` no Debug Console.

## 3. Resultado esperado

O validador deve identificar o conflito entre os agendamentos AP-0001 e AP-0002, informar os registros envolvidos e reprovar a validação.

Também deve identificar os demais dados inválidos presentes no arquivo de teste.

## 4. Resultado obtido

O validador identificou seis problemas:

1. AP-0003: data inválida (`2026-13-45`).
2. AP-0003: horário inválido (`25:00`).
3. AP-0003: status inválido (`Pendente`).
4. AP-0004: campo obrigatório `tutor` não informado.
5. AP-0004: serviço inexistente (`servico-que-nao-existe`).
6. Conflito entre AP-0001 e AP-0002 em 20/10/2026 às 08:00.

A validação foi reprovada, conforme esperado para esse conjunto de dados.

## 5. Causa identificada

Os dados inválidos foram inseridos intencionalmente no arquivo `data/agenda-invalida.json` para testar as regras de validação.

O conflito ocorre porque dois agendamentos não cancelados possuem a mesma data e o mesmo horário.

Não foi identificado defeito no código do validador durante esse teste. O comportamento observado foi o esperado.

## 6. Evidência da depuração

Captura de tela: [`docs/depuracao.png`](depuracao.png).

A imagem registra a execução no depurador do VS Code e a inspeção dos seis problemas encontrados.

## 7. Implementação relacionada

A implementação do validador de agenda foi registrada no commit `ee96ff9` — `feat: adiciona fechamento e validador da agenda`, integrado à branch `develop` por meio do PR #8.

Nesta atividade, foi realizado o teste controlado e documentado o comportamento do validador.

## 8. Conclusão

A depuração confirmou que o validador identifica dados inválidos, horários duplicados e inconsistências nos agendamentos, impedindo a aprovação de uma agenda com problemas.
