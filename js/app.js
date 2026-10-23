import { buscarServicos } from "./api.js";
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

const formulario = document.querySelector(".form");
const mensagemFormulario = document.querySelector("#mensagem-formulario");
const campoDataAgenda = document.querySelector("#dia");

const estado = {
  servicos: [],
  agenda: lerJSON("agendamentos", []),
  gerarProtocolo: criarGeradorProtocolo(lerJSON("agendamentos", []).length),
};

if (campoDataAgenda) {
  campoDataAgenda.value = hojeISO();
}

if (formulario) {
  const campoData = formulario.querySelector("#data");
  if (campoData) campoData.min = hojeISO();
}

function atualizarAgenda() {
  if (campoDataAgenda) {
    renderizarAgendamentos(estado.agenda, campoDataAgenda.value);
  }
}

async function carregarServicos() {
  const lista = document.querySelector("#lista-servicos");
  if (!lista) return;

  lista.setAttribute("aria-busy", "true");
  lista.replaceChildren();

  const carregando = document.createElement("li");
  carregando.className = "servicos__mensagem";
  carregando.textContent = "Carregando serviços...";
  lista.append(carregando);

  try {
    estado.servicos = await buscarServicos();
    renderizarServicos(estado.servicos);
    preencherSelectServicos(estado.servicos);
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
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensagemFormulario.textContent = "";

    const dados = new FormData(formulario);

    const telefone = String(dados.get("telefone") || "");
    const digitosTelefone = telefone.replace(/\D/g, "");
    const data = String(dados.get("data") || "");
    const hora = String(dados.get("horario") || "");
    const servicoId = String(dados.get("servico") || "");

    const servico = estado.servicos.find((item) => item.id === servicoId);

    // Percorre os campos na ordem em que aparecem no formulário.
    const campos = Array.from(
      formulario.querySelectorAll("input, select, textarea"),
    );

    for (const campo of campos) {
      // Telefone: verifica se tem DDD e quantidade válida de dígitos.
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

      // Serviço: verifica se a opção existe na lista carregada.
      if (campo.id === "servico" && campo.value && !servico) {
        mensagemFormulario.textContent = "Selecione um serviço válido.";
        campo.focus();
        return;
      }

      // Verifica os campos obrigatórios e as regras HTML.
      if (!campo.checkValidity()) {
        mensagemFormulario.textContent =
          "Preencha todos os campos obrigatórios corretamente.";
        campo.focus();
        return;
      }
    }

    const domiciliar = dados.get("domiciliar") === "on";

    if (domiciliar && !servico.domiciliar) {
      mensagemFormulario.textContent =
        "O serviço selecionado não permite atendimento domiciliar.";
      formulario.querySelector("#domiciliar").focus();
      return;
    }

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
      observacoes: String(dados.get("observacoes") || "").trim(),
      status: "Agendado",
    };

    estado.agenda.push(agendamento);

    if (!salvarJSON("agendamentos", estado.agenda)) {
      estado.agenda.pop();
      mensagemFormulario.textContent =
        "Não foi possível salvar. Verifique o armazenamento do navegador e tente novamente.";
      return;
    }

    formulario.reset();

    if (campoDataAgenda) {
      campoDataAgenda.value = data;
    }

    mensagemFormulario.textContent = `Agendamento ${agendamento.protocolo} salvo com sucesso!`;

    atualizarAgenda();
  });
}

campoDataAgenda?.addEventListener("change", atualizarAgenda);

carregarServicos();
atualizarAgenda();
