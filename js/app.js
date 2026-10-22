import { buscarServicos } from "./api.js";
import { criarGeradorProtocolo } from "./dominio/agendamento.js";
import { renderizarServicos, preencherSelectServicos } from "./ui.js";

function hojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

const estado = {
  servicos: [],
  agenda: [],
  dataAgenda: hojeISO(),
  filtroStatus: "todos",
  busca: "",
  expandidos: new Set(),
  feriado: null,
  gerarProtocolo: criarGeradorProtocolo(0),
  timerLembretes: null,
  lembretesAtivos: true,
};

async function carregarServicos() {
  const lista = document.querySelector("#lista-servicos");

  if (!lista) {
    console.error("Contêiner #lista-servicos não encontrado.");
    return;
  }

  lista.setAttribute("aria-busy", "true");
  lista.replaceChildren();

  const mensagem = document.createElement("p");
  mensagem.className = "servicos__mensagem";
  mensagem.textContent = "Carregando serviços...";
  lista.append(mensagem);

  try {
    estado.servicos = await buscarServicos();

    renderizarServicos(estado.servicos);
    preencherSelectServicos(estado.servicos);
  } catch (erro) {
    lista.replaceChildren();

    const mensagemErro = document.createElement("p");
    mensagemErro.className = "servicos__mensagem";
    mensagemErro.setAttribute("role", "alert");
    mensagemErro.textContent =
      erro.message || "Não foi possível carregar os serviços.";

    const tentarNovamente = document.createElement("button");
    tentarNovamente.type = "button";
    tentarNovamente.textContent = "Tentar novamente";
    tentarNovamente.addEventListener("click", carregarServicos);

    lista.append(mensagemErro, tentarNovamente);
    lista.setAttribute("aria-busy", "false");

    console.error("Erro ao carregar serviços:", erro);
  }
}

carregarServicos();

const formulario = document.querySelector(".form");
const mensagemFormulario = document.querySelector("#mensagem-formulario");

if (formulario && mensagemFormulario) {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    mensagemFormulario.textContent = "";

    if (!formulario.checkValidity()) {
      mensagemFormulario.textContent =
        "Preencha todos os campos obrigatórios antes de continuar.";

      const campoInvalido = formulario.querySelector(":invalid");

      if (campoInvalido) {
        campoInvalido.focus();
      }

      return;
    }

    mensagemFormulario.textContent =
      "Validação concluída! Todos os campos obrigatórios foram preenchidos.";
  });
} else {
  console.error("Formulário ou área de mensagem não encontrados no HTML.");
}
