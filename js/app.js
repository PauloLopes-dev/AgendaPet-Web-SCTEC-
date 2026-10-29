import { buscarServicos, buscarCep, buscarFeriados } from "./api.js";
import {
  renderizarServicos,
  preencherSelectServicos,
  renderizarAgendamentos,
} from "./ui.js";
import { lerJSON, salvarJSON } from "./storage.js";
import { criarGeradorProtocolo } from "./dominio/agendamento.js";

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

  // Reutiliza o cache se ainda estiver válido.
  if (
    cache &&
    Array.isArray(cache.dados) &&
    Date.now() - cache.consultadoEm < VALIDADE_CACHE_FERIADOS
  ) {
    return cache.dados;
  }

  // Se não houver cache válido, consulta a API.
  const feriados = await buscarFeriados(ano);

  if (!Array.isArray(feriados)) {
    throw new Error("A API não retornou uma lista válida de feriados.");
  }

  // Salva a lista e a data da consulta no localStorage.
  salvarJSON(chave, {
    dados: feriados,
    consultadoEm: Date.now(),
  });

  return feriados;
}

const formulario = document.querySelector(".form");
const mensagemFormulario = document.querySelector("#mensagem-formulario");
const campoDataAgenda = document.querySelector("#dia");
const campoStatusAgenda = document.querySelector("#status");
const campoDataFormulario = document.querySelector("#data");
campoDataFormulario?.addEventListener("change", async () => {
  const data = campoDataFormulario.value;

  mensagemFormulario.textContent = "";

  if (!data) {
    return;
  }

  try {
    const feriados = await obterFeriados(Number(data.slice(0, 4)));

    const feriado = feriados.find((item) => item.date === data);

    if (feriado) {
      mensagemFormulario.textContent = `${feriado.name} é feriado nesta data. Ao salvar, será necessário confirmar o agendamento.`;
    }
  } catch (erro) {
    console.error("Falha ao consultar feriados:", erro);

    mensagemFormulario.textContent =
      "Não foi possível consultar os feriados. Você poderá tentar continuar com o agendamento.";
  }
});

// Campos relacionados ao atendimento domiciliar.
const campoServico = document.querySelector("#servico");
const campoDomiciliar = document.querySelector("#domiciliar");
const grupoEndereco = document.querySelector("#grupo-endereco");

const camposEndereco = [
  "cep",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "uf",
].map((id) => document.querySelector(`#${id}`));

const campoCep = document.querySelector("#cep");
const mensagemCep = document.querySelector("#mensagem-cep");

async function preencherEnderecoPeloCep() {
  if (!campoCep) return;

  const cep = campoCep.value.replace(/\D/g, "");

  console.log("CEP digitado:", campoCep.value);
  console.log("CEP limpo:", cep);
  console.log("Quantidade de dígitos:", cep.length);

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

// Carrega os agendamentos salvos apenas uma vez.
const agendaSalva = lerJSON("agendamentos", []);

const estado = {
  servicos: [],
  agenda: agendaSalva,
  gerarProtocolo: criarGeradorProtocolo(agendaSalva.length),
};

if (campoDataAgenda) {
  campoDataAgenda.value = hojeISO();
}

if (formulario) {
  const campoData = formulario.querySelector("#data");

  if (campoData) {
    campoData.min = hojeISO();
  }
}

// Mostra o endereço somente se o serviço permitir
// atendimento domiciliar e o checkbox estiver marcado.
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
      // Complemento é opcional; os demais campos são obrigatórios
      // somente durante um atendimento domiciliar.
      campo.required = mostrarEndereco && campo.id !== "complemento";
    }
  });
}

// Atualiza a exibição quando o serviço ou checkbox mudar.
campoServico?.addEventListener("change", atualizarEndereco);
campoDomiciliar?.addEventListener("change", atualizarEndereco);

function atualizarAgenda() {
  if (campoDataAgenda) {
    renderizarAgendamentos(
      estado.agenda,
      campoDataAgenda.value,
      campoStatusAgenda?.value || "Todos",
    );
  }
}

function alterarStatusAgendamento(protocolo, novoStatus) {
  estado.agenda = estado.agenda.map((agendamento) =>
    agendamento.protocolo === protocolo
      ? { ...agendamento, status: novoStatus }
      : agendamento,
  );

  salvarJSON("agendamentos", estado.agenda);
  atualizarAgenda();
}

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

    // Reavalia o checkbox depois de carregar os serviços.
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

    // Valida os campos na ordem em que aparecem no formulário.
    const campos = Array.from(
      formulario.querySelectorAll("input, select, textarea"),
    );

    for (const campo of campos) {
      // Telefone: exige DDD e 10 ou 11 dígitos.
      if (
        campo.id === "telefone" &&
        campo.value.trim() !== "" &&
        (digitosTelefone.length < 10 || digitosTelefone.length > 11)
      ) {
        mensagemFormulario.textContent = "Informe um telefone válido com DDD.";
        campo.focus();
        return;
      }

      // Data: não permite agendamentos no passado.
      if (campo.id === "data" && campo.value && campo.value < hojeISO()) {
        mensagemFormulario.textContent =
          "A data do agendamento não pode estar no passado.";
        campo.focus();
        return;
      }

      // Horário: respeita o funcionamento da loja.
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

      // Serviço: verifica se a opção selecionada existe.
      if (campo.id === "servico" && campo.value && !servico) {
        mensagemFormulario.textContent = "Selecione um serviço válido.";
        campo.focus();
        return;
      }

      // Verifica campos obrigatórios e regras HTML.
      if (!campo.checkValidity()) {
        mensagemFormulario.textContent =
          "Preencha todos os campos obrigatórios corretamente.";
        campo.focus();
        return;
      }
    }

    // Verifica as regras de atendimento domiciliar.
    const domiciliar = dados.get("domiciliar") === "on";

    if (domiciliar && (!servico || !servico.domiciliar)) {
      mensagemFormulario.textContent =
        "O serviço selecionado não permite atendimento domiciliar.";

      campoDomiciliar?.focus();
      return;
    }

    // Impede dois agendamentos no mesmo dia e horário.
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

    // Verifica se a data escolhida é feriado.
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
        "Não foi possível consultar os feriados. Deseja continuar com o agendamento mesmo assim?",
      );

      if (!continuar) {
        mensagemFormulario.textContent =
          "Agendamento não salvo. Tente consultar a data novamente.";
        formulario.querySelector("#data").focus();
        return;
      }
    }

    // Monta o objeto do novo agendamento.
    const agendamento = {
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

    // Adiciona temporariamente à agenda.
    estado.agenda.push(agendamento);

    // Salva no armazenamento do navegador.
    if (!salvarJSON("agendamentos", estado.agenda)) {
      estado.agenda.pop();

      mensagemFormulario.textContent =
        "Não foi possível salvar. Verifique o armazenamento do navegador e tente novamente.";

      return;
    }

    // Limpa o formulário após salvar com sucesso.
    formulario.reset();

    // Esconde o endereço e atualiza o estado do checkbox.
    atualizarEndereco();

    if (campoDataAgenda) {
      campoDataAgenda.value = data;
    }

    mensagemFormulario.textContent = `Agendamento ${agendamento.protocolo} salvo com sucesso!`;

    atualizarAgenda();
  });
}

// Atualiza a agenda quando o usuário escolhe outro dia.
campoDataAgenda?.addEventListener("change", atualizarAgenda);
campoStatusAgenda?.addEventListener("change", atualizarAgenda);

// Inicializa a aplicação.
atualizarEndereco();
carregarServicos();
atualizarAgenda();
