// -----------------------------------------------------------------------------
// CONFIGURAÇÕES DO AGENDAPET
// -----------------------------------------------------------------------------

export const CONFIG = Object.freeze({
  abertura: "08:00",
  fechamento: "18:00",
  passoMin: 30,

  // Ajustar conforme as regras da Patinhas & Cia.
  cidadeLoja: "Joinville",
  taxaDeslocamento: 20,
});

// -----------------------------------------------------------------------------
// FUNÇÃO AUXILIAR: NORMALIZAÇÃO DE CIDADES
// -----------------------------------------------------------------------------

function normalizarCidade(cidade = "") {
  return cidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// -----------------------------------------------------------------------------
// CLASSE AGENDAMENTO
// -----------------------------------------------------------------------------

export class Agendamento {
  constructor({
    protocolo,
    tutor,
    telefone,
    pet,
    especie,
    servicoId,
    servicoNome,
    preco,
    data,
    hora,
    domiciliar = false,
    cep = "",
    logradouro = "",
    numero = "",
    complemento = "",
    bairro = "",
    cidade = "",
    uf = "",
    observacoes = "",
    status = "Agendado",
  }) {
    this.protocolo = protocolo;
    this.tutor = tutor;
    this.telefone = telefone;
    this.pet = pet;
    this.especie = especie;
    this.servicoId = servicoId;
    this.servicoNome = servicoNome;
    this.preco = preco;
    this.data = data;
    this.hora = hora;
    this.domiciliar = domiciliar;
    this.cep = cep;
    this.logradouro = logradouro;
    this.numero = numero;
    this.complemento = complemento;
    this.bairro = bairro;
    this.cidade = cidade;
    this.uf = uf;
    this.observacoes = observacoes;
    this.status = status;
  }

  // Um agendamento só deixa de estar ativo quando é cancelado.
  get ativo() {
    return this.status !== "Cancelado";
  }

  // Retorna o valor do serviço.
  calcularValor() {
    return Number(this.preco) || 0;
  }

  // Verifica se dois agendamentos ocupam o mesmo horário.
  conflitaCom(outro) {
    return (
      outro instanceof Agendamento &&
      this !== outro &&
      this.ativo &&
      outro.ativo &&
      this.data === outro.data &&
      this.hora === outro.hora
    );
  }

  // Prepara os dados para armazenamento em JSON.
  paraJSON() {
    return {
      protocolo: this.protocolo,
      tutor: this.tutor,
      telefone: this.telefone,
      pet: this.pet,
      especie: this.especie,
      servicoId: this.servicoId,
      servicoNome: this.servicoNome,
      preco: this.preco,
      data: this.data,
      hora: this.hora,
      domiciliar: this.domiciliar,
      cep: this.cep,
      logradouro: this.logradouro,
      numero: this.numero,
      complemento: this.complemento,
      bairro: this.bairro,
      cidade: this.cidade,
      uf: this.uf,
      observacoes: this.observacoes,
      status: this.status,
    };
  }
}

// -----------------------------------------------------------------------------
// CLASSE AGENDAMENTO DOMICILIAR
// -----------------------------------------------------------------------------

export class AgendamentoDomiciliar extends Agendamento {
  constructor(dados) {
    super({
      ...dados,
      domiciliar: true,
    });

    this.endereco = {
      cep: this.cep,
      logradouro: this.logradouro,
      numero: this.numero,
      complemento: this.complemento,
      bairro: this.bairro,
      cidade: this.cidade,
      uf: this.uf,
    };
  }

  calcularValor() {
    return super.calcularValor() + this.taxaDeslocamento();
  }

  taxaDeslocamento() {
    const cidadeLoja = normalizarCidade(CONFIG.cidadeLoja);
    const cidadeAtendimento = normalizarCidade(this.cidade);

    if (!cidadeLoja || cidadeLoja === "preencher") {
      return 0;
    }

    if (cidadeLoja === cidadeAtendimento) {
      return 0;
    }

    return CONFIG.taxaDeslocamento;
  }

  paraJSON() {
    return {
      ...super.paraJSON(),
      domiciliar: true,
    };
  }
}

// -----------------------------------------------------------------------------
// GERADOR DE PROTOCOLO COM CLOSURE
// -----------------------------------------------------------------------------

export function criarGeradorProtocolo(ultimo = 0) {
  let contador = ultimo;

  return function proximoProtocolo() {
    contador += 1;
    return `AP-${String(contador).padStart(4, "0")}`;
  };
}
