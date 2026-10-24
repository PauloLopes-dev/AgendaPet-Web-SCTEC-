export class ErroApi extends Error {
  constructor(tipo, mensagem) {
    super(mensagem);
    this.name = "ErroApi";
    this.tipo = tipo;
  }
}

export async function buscarJSON(url) {
  let resposta;

  try {
    resposta = await fetch(url);
  } catch {
    throw new ErroApi("rede", "Não foi possível conectar ao servidor.");
  }

  if (!resposta.ok) {
    throw new ErroApi("http", `Erro HTTP ${resposta.status}`);
  }

  try {
    return await resposta.json();
  } catch {
    throw new ErroApi(
      "json",
      "Não foi possível interpretar os dados recebidos.",
    );
  }
}

export async function buscarServicos() {
  return buscarJSON("./data/servicos.json");
}
