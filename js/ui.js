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
