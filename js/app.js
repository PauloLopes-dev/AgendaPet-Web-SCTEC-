import { buscarServicos, buscarCep, buscarFeriados } from "./api.js";

import {
  renderizarServicos,
  preencherSelectServicos,
  renderizarAgendamentos,
} from "./ui.js";

import { lerJSON, salvarJSON, limparDados } from "./storage.js";

import {
  Agendamento,
  AgendamentoDomiciliar,
  criarGeradorProtocolo,
} from "./dominio/agendamento.js";

import { verificarConflito } from "./dominio/regras.js";
import { fecharDia } from "./dominio/fechamento.js";

// -----------------------------------------------------------------------------
// 1. DATA E FERIADOS
// -----------------------------------------------------------------------------

function hojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

const VALIDADE_CACHE_FERIADOS = 30 * 24 * 60 * 60 * 1000;

async function obterFeriados(ano) {
  const chave = `feriados-${ano}`;
  const cache = lerJSON(chave, null);

  if (
    cache &&
    Array.isArray(cache.dados) &&
    Date.now() - cache.consultadoEm < VALIDADE_CACHE_FERIADOS
  ) {
    return cache.dados;
  }

  const feriados = await buscarFeriados(ano);

  if (!Array.isArray(feriados)) {
    throw new Error("A API não retornou uma lista válida de feriados.");
  }

  salvarJSON(chave, {
    dados: feriados,
    consultadoEm: Date.now(),
  });

  return feriados;
}

// -----------------------------------------------------------------------------
// 2. ELEMENTOS DO HTML
// -----------------------------------------------------------------------------

const formulario = document.querySelector(".form");
const campoTutor = document.querySelector("#tutor");
const mensagemFormulario = document.querySelector("#mensagem-formulario");

const campoDataAgenda = document.querySelector("#dia");
const campoStatusAgenda = document.querySelector("#status");
const campoBusca = document.querySelector("#busca");
const campoDataFormulario = document.querySelector("#data");

const listaAgendamentos = document.querySelector("#lista-agendamentos");

const botaoPausarLembretes = document.querySelector("[data-pausar-lembretes]");

const areaToast = document.querySelector("[data-toast]");

const campoServico = document.querySelector("#servico");
const campoDomiciliar = document.querySelector("#domiciliar");
const grupoEndereco = document.querySelector("#grupo-endereco");

const campoCep = document.querySelector("#cep");
const mensagemCep = document.querySelector("#mensagem-cep");

const camposEndereco = [
  "cep",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "uf",
].map((id) => document.querySelector(`#${id}`));

// -----------------------------------------------------------------------------
// 3. ESTADO E ARMAZENAMENTO
// -----------------------------------------------------------------------------

const agendaSalva = lerJSON("agendamentos", []);

const filtrosSalvos = lerJSON("filtros", {
  data: hojeISO(),
  status: "Todos",
  busca: "",
});

const temaSalvo = lerJSON("tema", "claro");

const estado = {
  servicos: [],
  agenda: agendaSalva,
  gerarProtocolo: criarGeradorProtocolo(agendaSalva.length),
};

// -----------------------------------------------------------------------------
// EXPORTAÇÃO DA AGENDA EM JSON
// -----------------------------------------------------------------------------

const botaoExportar = document.querySelector("[data-exportar]");
const areaExportacao = document.querySelector("[data-area-exportacao]");
const campoJson = document.querySelector("#json-exportado");

botaoExportar?.addEventListener("click", () => {
  const json = JSON.stringify(estado.agenda, null, 2);

  campoJson.value = json;
  areaExportacao.hidden = false;
});

// -----------------------------------------------------------------------------
// COPIAR AGENDA EM JSON
// -----------------------------------------------------------------------------

const botaoCopiarJson = document.querySelector("[data-copiar-json]");

botaoCopiarJson?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(campoJson.value);

    alert("Agenda copiada com sucesso!");
  } catch (erro) {
    console.error("Erro ao copiar JSON:", erro);
    alert("Não foi possível copiar. Tente novamente.");
  }
});

// -----------------------------------------------------------------------------
// BAIXAR AGENDA EM ARQUIVO JSON
// -----------------------------------------------------------------------------

const botaoBaixarJson = document.querySelector("[data-baixar-json]");

botaoBaixarJson?.addEventListener("click", () => {
  const json = campoJson.value;

  const arquivo = new Blob([json], {
    type: "application/json",
  });

  const endereco = URL.createObjectURL(arquivo);

  const link = document.createElement("a");
  link.href = endereco;
  link.download = "agenda-patinhas-e-cia.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(endereco);
});

// -----------------------------------------------------------------------------
// LIMPAR DADOS DA AGENDA
// -----------------------------------------------------------------------------

const botaoLimparDados = document.querySelector("[data-limpar-dados]");

botaoLimparDados?.addEventListener("click", () => {
  const confirmou = confirm(
    "Tem certeza de que deseja apagar todos os agendamentos? Essa ação não poderá ser desfeita.",
  );

  if (!confirmou) return;

  const limpou = limparDados();

  if (!limpou) {
    alert("Não foi possível limpar os dados.");
    return;
  }

  estado.agenda = [];
  estado.gerarProtocolo = criarGeradorProtocolo(0);

  campoJson.value = "";
  areaExportacao.hidden = true;

  atualizarAgenda();

  alert("Os dados da agenda foram apagados com sucesso!");
});

// -----------------------------------------------------------------------------
// TEMA CLARO E ESCURO
// -----------------------------------------------------------------------------

const botaoTema = document.querySelector("[data-tema]");

function aplicarTema(tema) {
  if (tema === "escuro") {
    document.documentElement.setAttribute("data-tema", "escuro");
    botaoTema.textContent = "Tema claro";
  } else {
    document.documentElement.removeAttribute("data-tema");
    botaoTema.textContent = "Tema escuro";
  }
}

aplicarTema(temaSalvo);

botaoTema?.addEventListener("click", () => {
  const temaAtual =
    document.documentElement.getAttribute("data-tema") === "escuro"
      ? "escuro"
      : "claro";

  const novoTema = temaAtual === "escuro" ? "claro" : "escuro";

  aplicarTema(novoTema);
  salvarJSON("tema", novoTema);
});

// -----------------------------------------------------------------------------
// 4. CONFIGURAÇÃO INICIAL DAS DATAS
// -----------------------------------------------------------------------------

if (campoDataAgenda) {
  campoDataAgenda.value = filtrosSalvos.data || hojeISO();
}

if (campoStatusAgenda) {
  campoStatusAgenda.value = filtrosSalvos.status || "Todos";
}

if (campoBusca) {
  campoBusca.value = filtrosSalvos.busca || "";
}

if (campoDataFormulario) {
  campoDataFormulario.min = hojeISO();
}

// -----------------------------------------------------------------------------
// 5. AVISO DE FERIADOS AO ESCOLHER UMA DATA
// -----------------------------------------------------------------------------

campoDataFormulario?.addEventListener("change", async () => {
  const data = campoDataFormulario.value;

  if (mensagemFormulario) {
    mensagemFormulario.textContent = "";
  }

  if (!data) return;

  try {
    const feriados = await obterFeriados(Number(data.slice(0, 4)));

    const feriado = feriados.find((item) => item.date === data);

    if (feriado && mensagemFormulario) {
      mensagemFormulario.textContent =
        `${feriado.name} é feriado nesta data. ` +
        "Ao salvar, será necessário confirmar o agendamento.";
    }
  } catch (erro) {
    console.error("Falha ao consultar feriados:", erro);

    if (mensagemFormulario) {
      mensagemFormulario.textContent =
        "Não foi possível consultar os feriados. " +
        "Você poderá tentar continuar com o agendamento.";
    }
  }
});

// -----------------------------------------------------------------------------
// 6. CONSULTA DE CEP
// -----------------------------------------------------------------------------

async function preencherEnderecoPeloCep() {
  if (!campoCep) return;

  const cep = campoCep.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    if (mensagemCep) {
      mensagemCep.textContent = "CEP inválido. Digite os 8 dígitos do CEP.";
    }

    return;
  }

  if (mensagemCep) {
    mensagemCep.textContent = "Consultando CEP...";
  }

  try {
    const endereco = await buscarCep(cep);

    document.querySelector("#logradouro").value = endereco.logradouro || "";

    document.querySelector("#bairro").value = endereco.bairro || "";

    document.querySelector("#cidade").value = endereco.localidade || "";

    document.querySelector("#uf").value = endereco.uf || "";

    document.querySelector("#complemento").value = endereco.complemento || "";

    if (mensagemCep) {
      mensagemCep.textContent = "Endereço consultado. Confira os dados.";
    }
  } catch (erro) {
    if (mensagemCep) {
      mensagemCep.textContent =
        erro.message || "Não foi possível consultar o CEP.";
    }
  }
}

campoCep?.addEventListener("blur", preencherEnderecoPeloCep);

// -----------------------------------------------------------------------------
// 7. ATENDIMENTO DOMICILIAR
// -----------------------------------------------------------------------------

function atualizarEndereco() {
  const servico = estado.servicos.find(
    (item) => item.id === campoServico?.value,
  );

  const permiteDomiciliar = Boolean(servico?.domiciliar);

  const mostrarEndereco =
    permiteDomiciliar && Boolean(campoDomiciliar?.checked);

  if (campoDomiciliar) {
    campoDomiciliar.disabled = !permiteDomiciliar;

    if (!permiteDomiciliar) {
      campoDomiciliar.checked = false;
    }
  }

  if (grupoEndereco) {
    grupoEndereco.hidden = !mostrarEndereco;
  }

  camposEndereco.forEach((campo) => {
    if (campo) {
      campo.required = mostrarEndereco && campo.id !== "complemento";
    }
  });
}

campoServico?.addEventListener("change", atualizarEndereco);
campoDomiciliar?.addEventListener("change", atualizarEndereco);

// -----------------------------------------------------------------------------
// 8. ATUALIZAÇÃO DA AGENDA
// -----------------------------------------------------------------------------
// Exibe avisos temporários na tela.
let temporizadorToast = null;

function mostrarToast(mensagem, tipo = "info") {
  if (!areaToast) return;

  // Evita manter dois temporizadores ativos.
  if (temporizadorToast !== null) {
    clearTimeout(temporizadorToast);
  }

  areaToast.textContent = mensagem;
  areaToast.className = `toast toast--${tipo}`;
  areaToast.hidden = false;

  temporizadorToast = setTimeout(() => {
    areaToast.hidden = true;
    temporizadorToast = null;
  }, 5000);
}

// Guarda os agendamentos que já geraram um aviso.
const lembretesNotificados = new Set();

// Verifica se existe atendimento nos próximos 15 minutos.
function verificarLembretes() {
  const agora = new Date();

  const hoje = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");

  estado.agenda.forEach((agendamento) => {
    if (agendamento.status !== "Agendado" || agendamento.data !== hoje) {
      return;
    }

    const dataHora = new Date(`${agendamento.data}T${agendamento.hora}:00`);

    const minutosRestantes = (dataHora - agora) / 60000;

    if (minutosRestantes < 0 || minutosRestantes > 15) {
      return;
    }

    const identificador =
      agendamento.protocolo ||
      `${agendamento.data}-${agendamento.hora}-${agendamento.servicoNome}`;

    if (lembretesNotificados.has(identificador)) {
      return;
    }

    lembretesNotificados.add(identificador);

    mostrarToast(
      `Atenção! Atendimento de ${agendamento.hora} começa em até 15 minutos.`,
      "info",
    );
  });
}

// -----------------------------------------------------------------------------
// CONTROLE DOS LEMBRETES AUTOMÁTICOS
// -----------------------------------------------------------------------------

let lembretesAtivos = true;
let intervaloLembretes = null;

function iniciarLembretes() {
  if (intervaloLembretes !== null) return;

  lembretesAtivos = true;
  verificarLembretes();

  intervaloLembretes = setInterval(() => {
    verificarLembretes();
    atualizarAgenda();
  }, 30 * 1000);

  if (botaoPausarLembretes) {
    botaoPausarLembretes.textContent = "Pausar lembretes";
    botaoPausarLembretes.setAttribute("aria-pressed", "false");
  }

  atualizarAgenda();
}

function pausarLembretes() {
  if (intervaloLembretes !== null) {
    clearInterval(intervaloLembretes);
    intervaloLembretes = null;
  }

  lembretesAtivos = false;

  if (botaoPausarLembretes) {
    botaoPausarLembretes.textContent = "Retomar lembretes";
    botaoPausarLembretes.setAttribute("aria-pressed", "true");
  }
}

botaoPausarLembretes?.addEventListener("click", () => {
  if (lembretesAtivos) {
    pausarLembretes();
  } else {
    iniciarLembretes();
  }
});

function atualizarAgenda() {
  if (!campoDataAgenda) return;

  const filtros = {
    data: campoDataAgenda.value,
    status: campoStatusAgenda?.value || "Todos",
    busca: campoBusca?.value || "",
  };

  salvarJSON("filtros", filtros);

  renderizarAgendamentos(
    estado.agenda,
    filtros.data,
    filtros.status,
    filtros.busca,
  );

  atualizarFechamento();
}

function atualizarFechamento() {
  const fechamento = fecharDia(estado.agenda, campoDataAgenda.value);

  const valores = document.querySelectorAll(
    "#fechamento-do-dia .resumo__valor",
  );

  const concluidos = estado.agenda.filter(
    (agendamento) =>
      agendamento.data === campoDataAgenda.value &&
      agendamento.status === "Concluído",
  ).length;

  const agendados = estado.agenda.filter(
    (agendamento) =>
      agendamento.data === campoDataAgenda.value &&
      agendamento.status === "Agendado",
  ).length;

  const aReceber = estado.agenda
    .filter(
      (agendamento) =>
        agendamento.data === campoDataAgenda.value &&
        agendamento.status === "Agendado",
    )
    .reduce((total, agendamento) => {
      const instancia = agendamento.domiciliar
        ? new AgendamentoDomiciliar(agendamento)
        : new Agendamento(agendamento);

      return total + instancia.calcularValor();
    }, 0);

  const moeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  valores[0].textContent = fechamento.totalAtendimentos;
  valores[1].textContent = concluidos;
  valores[2].textContent = agendados;
  valores[3].textContent = fechamento.cancelados;
  valores[4].textContent = moeda(fechamento.faturamento);
  valores[5].textContent = moeda(aReceber);
}

campoDataAgenda?.addEventListener("change", atualizarAgenda);
campoStatusAgenda?.addEventListener("change", atualizarAgenda);
campoBusca?.addEventListener("input", atualizarAgenda);

document.addEventListener("keydown", (evento) => {
  if (
    evento.key.toLowerCase() === "n" &&
    !evento.ctrlKey &&
    !evento.altKey &&
    !evento.metaKey &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(evento.target.tagName)
  ) {
    evento.preventDefault();
    evento.stopPropagation();
    campoTutor?.focus();
    return;
  }

  if (
    evento.key === "/" &&
    !evento.ctrlKey &&
    !evento.altKey &&
    !evento.metaKey &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  ) {
    evento.preventDefault();
    campoBusca?.focus();
    return;
  }

  if (evento.key === "Escape") {
    if (campoBusca?.value) {
      evento.preventDefault();
      campoBusca.value = "";
      atualizarAgenda();
    }
  }
});

// -----------------------------------------------------------------------------
// 9. ALTERAÇÃO DO STATUS DOS AGENDAMENTOS
// -----------------------------------------------------------------------------

function alterarStatusAgendamento(protocolo, novoStatus) {
  const agendamentoAtual = estado.agenda.find(
    (agendamento) => agendamento.protocolo === protocolo,
  );

  // Somente agendamentos podem mudar de status.
  if (!agendamentoAtual || agendamentoAtual.status !== "Agendado") {
    return;
  }

  estado.agenda = estado.agenda.map((agendamento) =>
    agendamento.protocolo === protocolo
      ? { ...agendamento, status: novoStatus }
      : agendamento,
  );

  const salvou = salvarJSON("agendamentos", estado.agenda);

  if (!salvou) {
    console.error("Falha ao salvar o novo status.");
    atualizarAgenda();
    return;
  }

  atualizarAgenda();
}

// Um único ouvinte controla os dois botões da lista.
listaAgendamentos?.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button");

  if (!botao || !listaAgendamentos.contains(botao)) return;

  const protocolo = botao.dataset.protocolo;
  const acao = botao.dataset.acao;

  if (!protocolo) return;

  if (acao === "concluir") {
    alterarStatusAgendamento(protocolo, "Concluído");
  }

  if (acao === "cancelar") {
    alterarStatusAgendamento(protocolo, "Cancelado");
  }
});

listaAgendamentos?.addEventListener("click", (evento) => {
  const item = evento.target.closest(".agendamento-item");

  if (!item || !listaAgendamentos.contains(item)) return;

  listaAgendamentos
    .querySelectorAll(".agendamento-item.selecionado")
    .forEach((selecionado) => {
      selecionado.classList.remove("selecionado");
    });

  item.classList.add("selecionado");
});

listaAgendamentos?.addEventListener("keydown", (evento) => {
  if (
    evento.target.classList.contains("agendamento-item") &&
    (evento.key === "Enter" || evento.key === " ")
  ) {
    evento.preventDefault();

    listaAgendamentos
      .querySelectorAll(".agendamento-item.selecionado")
      .forEach((selecionado) => {
        selecionado.classList.remove("selecionado");
      });

    evento.target.classList.add("selecionado");
  }
});

// -----------------------------------------------------------------------------
// 10. CARREGAMENTO DOS SERVIÇOS
// -----------------------------------------------------------------------------

async function carregarServicos() {
  const lista = document.querySelector("#lista-servicos");

  if (!lista) return;

  lista.setAttribute("aria-busy", "true");
  lista.replaceChildren();

  const carregando = document.createElement("li");
  carregando.className = "servicos__mensagem";
  carregando.textContent = "Carregando serviços.";

  lista.append(carregando);

  try {
    estado.servicos = await buscarServicos();

    renderizarServicos(estado.servicos);
    preencherSelectServicos(estado.servicos);

    atualizarEndereco();
  } catch (erro) {
    lista.replaceChildren();

    const aviso = document.createElement("li");
    aviso.className = "servicos__mensagem";
    aviso.setAttribute("role", "alert");
    aviso.textContent = "Não foi possível carregar os serviços.";

    const tentarNovamente = document.createElement("button");
    tentarNovamente.type = "button";
    tentarNovamente.textContent = "Tentar novamente";
    tentarNovamente.addEventListener("click", carregarServicos);

    lista.append(aviso, tentarNovamente);

    console.error(erro);
  } finally {
    lista.setAttribute("aria-busy", "false");
  }
}

// -----------------------------------------------------------------------------
// 11. CADASTRO DE AGENDAMENTOS
// -----------------------------------------------------------------------------

if (formulario && mensagemFormulario) {
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dados = new FormData(formulario);

    const telefone = String(dados.get("telefone") || "");
    const digitosTelefone = telefone.replace(/\D/g, "");

    const data = String(dados.get("data") || "");
    const hora = String(dados.get("horario") || "");
    const servicoId = String(dados.get("servico") || "");

    const servico = estado.servicos.find((item) => item.id === servicoId);

    // Validação dos campos.
    const campos = Array.from(
      formulario.querySelectorAll("input, select, textarea"),
    );

    for (const campo of campos) {
      if (
        campo.id === "telefone" &&
        campo.value.trim() !== "" &&
        (digitosTelefone.length < 10 || digitosTelefone.length > 11)
      ) {
        mensagemFormulario.textContent = "Informe um telefone válido com DDD.";

        campo.focus();
        return;
      }

      if (campo.id === "data" && campo.value && campo.value < hojeISO()) {
        mensagemFormulario.textContent =
          "A data do agendamento não pode estar no passado.";

        campo.focus();
        return;
      }

      if (
        campo.id === "horario" &&
        campo.value &&
        (campo.value < "08:00" || campo.value > "17:30")
      ) {
        mensagemFormulario.textContent =
          "Escolha um horário entre 08:00 e 17:30.";

        campo.focus();
        return;
      }

      if (campo.id === "servico" && campo.value && !servico) {
        mensagemFormulario.textContent = "Selecione um serviço válido.";

        campo.focus();
        return;
      }

      if (!campo.checkValidity()) {
        mensagemFormulario.textContent =
          "Preencha todos os campos obrigatórios corretamente.";

        campo.focus();
        return;
      }
    }

    // Validação do atendimento domiciliar.
    const domiciliar = dados.get("domiciliar") === "on";

    if (domiciliar && (!servico || !servico.domiciliar)) {
      mensagemFormulario.textContent =
        "O serviço selecionado não permite atendimento domiciliar.";

      campoDomiciliar?.focus();
      return;
    }

    // Verificação de conflito de horário.
    const conflito = estado.agenda.some(
      (item) =>
        item.data === data && item.hora === hora && item.status !== "Cancelado",
    );

    if (conflito) {
      mensagemFormulario.textContent =
        "Já existe um agendamento para este dia e horário.";

      formulario.querySelector("#horario").focus();
      return;
    }

    // Consulta de feriados.
    try {
      const feriados = await obterFeriados(Number(data.slice(0, 4)));

      const feriado = feriados.find((item) => item.date === data);

      if (feriado) {
        const confirmou = window.confirm(
          `${feriado.name} é feriado nesta data. Deseja agendar mesmo assim?`,
        );

        if (!confirmou) {
          mensagemFormulario.textContent =
            "Agendamento não salvo. Escolha outra data, se desejar.";

          formulario.querySelector("#data").focus();
          return;
        }
      }
    } catch (erro) {
      console.error("Falha ao consultar feriados:", erro);

      const continuar = window.confirm(
        "Não foi possível consultar os feriados. " +
          "Deseja continuar com o agendamento mesmo assim?",
      );

      if (!continuar) {
        mensagemFormulario.textContent =
          "Agendamento não salvo. Tente consultar a data novamente.";

        formulario.querySelector("#data").focus();
        return;
      }
    }

    // Montagem dos dados do agendamento.
    const dadosAgendamento = {
      protocolo: estado.gerarProtocolo(),
      tutor: String(dados.get("tutor")).trim(),
      telefone: telefone.trim(),
      pet: String(dados.get("pet")).trim(),
      especie: String(dados.get("especie")),
      servicoId: servico.id,
      servicoNome: servico.nome,
      preco: servico.preco,
      data,
      hora,
      domiciliar,

      cep: domiciliar ? String(dados.get("cep") || "").trim() : "",
      logradouro: domiciliar
        ? String(dados.get("logradouro") || "").trim()
        : "",
      numero: domiciliar ? String(dados.get("numero") || "").trim() : "",
      complemento: domiciliar
        ? String(dados.get("complemento") || "").trim()
        : "",
      bairro: domiciliar ? String(dados.get("bairro") || "").trim() : "",
      cidade: domiciliar ? String(dados.get("cidade") || "").trim() : "",
      uf: domiciliar ? String(dados.get("uf") || "").trim() : "",

      observacoes: String(dados.get("observacoes") || "").trim(),
      status: "Agendado",
    };

    // Cria uma instância conforme o tipo de atendimento.
    const agendamento = domiciliar
      ? new AgendamentoDomiciliar(dadosAgendamento)
      : new Agendamento(dadosAgendamento);

    console.log("Valor calculado:", agendamento.calcularValor());

    // Verifica se o horário já está ocupado.
    if (verificarConflito(estado.agenda, agendamento)) {
      mensagemFormulario.textContent =
        "Este horário já está ocupado. Escolha outro horário.";

      return;
    }
    // Salvar o agendamento.
    estado.agenda.push(agendamento);

    if (!salvarJSON("agendamentos", estado.agenda)) {
      estado.agenda.pop();

      mensagemFormulario.textContent =
        "Não foi possível salvar. Verifique o armazenamento do navegador.";

      return;
    }

    // Limpeza do formulário.
    formulario.reset();
    atualizarEndereco();

    if (campoDataAgenda) {
      campoDataAgenda.value = data;
    }

    mensagemFormulario.textContent = `Agendamento ${agendamento.protocolo} salvo com sucesso!`;

    atualizarAgenda();
  });
}

// -----------------------------------------------------------------------------
// 12. INICIALIZAÇÃO
// -----------------------------------------------------------------------------

atualizarEndereco();
carregarServicos();
atualizarAgenda();
iniciarLembretes();
