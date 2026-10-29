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

export function renderizarAgendamentos(
  agendamentos,
  dataSelecionada,
  statusSelecionado = "Todos",
) {
  const lista = document.querySelector("#lista-agendamentos");
  const mensagemVazia = document.querySelector(".vazio");
  const contador = document.querySelector(".contador");

  if (!lista || !mensagemVazia || !contador) {
    console.error("Elementos da agenda não encontrados.");
    return;
  }

  lista.replaceChildren();

  const doDia = agendamentos
    .filter((agendamento) => agendamento.data === dataSelecionada)
    .filter(
      (agendamento) =>
        statusSelecionado === "Todos" ||
        agendamento.status === statusSelecionado,
    );

  mensagemVazia.hidden = doDia.length > 0;

  contador.textContent = `${doDia.length} agendamento${
    doDia.length === 1 ? "" : "s"
  }`;

  doDia
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .forEach((agendamento) => {
      const item = document.createElement("article");
      item.className = "servico";

      // Hora + nome do pet
      const titulo = document.createElement("h3");
      titulo.textContent = `${agendamento.hora} — ${agendamento.pet}`;

      // Nome do tutor
      const tutor = document.createElement("p");
      tutor.textContent = `Tutor: ${agendamento.tutor}`;

      // Status
      const status = document.createElement("p");
      status.textContent = `Status: ${agendamento.status}`;

      // Espaço para os botões de ação
      const acoes = document.createElement("div");
      acoes.classList.add("acoes-agendamento");

      const botaoConcluir = document.createElement("button");
      botaoConcluir.type = "button";
      botaoConcluir.textContent = "Concluir";
      botaoConcluir.classList.add("botao-concluir");
      botaoConcluir.dataset.protocolo = agendamento.protocolo;

      const botaoCancelar = document.createElement("button");
      botaoCancelar.type = "button";
      botaoCancelar.textContent = "Cancelar";
      botaoCancelar.classList.add("botao-cancelar");
      botaoCancelar.dataset.protocolo = agendamento.protocolo;

      acoes.append(botaoConcluir, botaoCancelar);

      // Ordem: hora/pet → tutor → status → ações
      item.append(titulo, tutor, status, acoes);

      // Endereço somente para atendimento domiciliar
      if (agendamento.domiciliar) {
        const endereco = document.createElement("p");

        const partesEndereco = [
          agendamento.logradouro,
          agendamento.numero,
          agendamento.complemento,
          agendamento.bairro,
          agendamento.cidade,
          agendamento.uf,
          agendamento.cep,
        ].filter((parte) => parte && String(parte).trim() !== "");

        endereco.textContent = partesEndereco.length
          ? `Endereço: ${partesEndereco.join(", ")}`
          : "Endereço domiciliar não informado.";

        item.append(endereco);
      }

      // Adiciona cada agendamento somente uma vez
      lista.append(item);
    });
}
