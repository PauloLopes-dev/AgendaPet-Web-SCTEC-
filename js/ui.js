export function renderizarServicos(servicos) {
  const lista = document.querySelector("#lista-servicos");

  if (!lista) {
    throw new Error("Elemento #lista-servicos não encontrado no HTML.");
  }

  lista.replaceChildren();

  servicos.forEach((servico) => {
    const artigo = document.createElement("article");
    artigo.className = "servico";

    const topo = document.createElement("div");
    topo.className = "servico__topo";

    const nome = document.createElement("strong");
    nome.textContent = servico.nome;

    const preco = document.createElement("span");
    preco.className = "servico__preco";
    preco.textContent = servico.preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    topo.append(nome, preco);

    const descricao = document.createElement("p");
    descricao.className = "servico__descricao";
    descricao.textContent = servico.descricao;

    const meta = document.createElement("p");
    meta.className = "servico__meta";
    meta.textContent = `${servico.duracaoMin} min · ${
      servico.domiciliar ? "faz atendimento domiciliar" : "somente na loja"
    }`;

    artigo.append(topo, descricao, meta);
    lista.append(artigo);
  });

  lista.setAttribute("aria-busy", "false");
}

export function preencherSelectServicos(servicos) {
  const select = document.querySelector("#servico");

  if (!select) {
    throw new Error("Campo #servico não encontrado no HTML.");
  }

  select.replaceChildren();

  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = "Selecione um serviço...";
  opcaoInicial.disabled = true;
  opcaoInicial.selected = true;

  select.append(opcaoInicial);

  servicos.forEach((servico) => {
    const opcao = document.createElement("option");
    opcao.value = servico.id;
    opcao.textContent = servico.nome;

    select.append(opcao);
  });
}
export function renderizarAgendamentos(agendamentos, dataSelecionada) {
  const lista = document.querySelector("#lista-agendamentos");
  const mensagemVazia = document.querySelector(".vazio");
  const contador = document.querySelector(".contador");

  if (!lista || !mensagemVazia || !contador) {
    console.error("Elementos da agenda não encontrados.");
    return;
  }

  lista.replaceChildren();

  const doDia = agendamentos.filter(
    (agendamento) =>
      agendamento.data === dataSelecionada &&
      agendamento.status !== "Cancelado",
  );

  mensagemVazia.hidden = doDia.length > 0;
  contador.textContent = `${doDia.length} agendamento${doDia.length === 1 ? "" : "s"}`;

  doDia
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .forEach((agendamento) => {
      const item = document.createElement("article");
      item.className = "servico";

      const titulo = document.createElement("h3");
      titulo.textContent = `${agendamento.hora} — ${agendamento.pet}`;

      const detalhes = document.createElement("p");
      detalhes.textContent = `Tutor: ${agendamento.tutor} | Serviço: ${agendamento.servicoNome}`;

      const status = document.createElement("p");
      status.textContent = `Status: ${agendamento.status}`;

      item.append(titulo, detalhes, status);
      lista.append(item);
    });
}
