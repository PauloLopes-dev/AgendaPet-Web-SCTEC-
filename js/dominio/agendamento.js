export const CONFIG = Object.freeze({
  abertura: "08:00",
  fechamento: "18:00",
  passoMin: 30 /* TODO: taxas,
cidade da loja... */,
});
export class Agendamento {
  constructor({
    protocolo,
    tutor,
    /* TODO: demais campos */ servico,
    data,
    hora,
    status = "Agendado",
  }) {
    this.protocolo = protocolo;
    // TODO: guardar os demais campos em this.*
  }
  get ativo() {
    /* TODO: true quando o status NÃO é "Cancelado" */
  }
  calcularValor() {
    return this.servico.preco;
  }
  conflitaCom(outro) {
    // TODO: true se os DOIS estão ativos, são de datas/horas iguais e NÃO são o mesmo objeto (this !== outro)
  }
  paraJSON() {
    /* TODO: objeto simples; em vez de this.servico, guarde servicoId: this.servico.id */
  }
}
export class AgendamentoDomiciliar extends Agendamento {
  constructor({ endereco, ...dados }) {
    super(dados); // 1) chama o construtor da classe-mãe  2) só depois use this
    this.endereco = endereco;
  }
  calcularValor() {
    return super.calcularValor() + this.taxaDeslocamento();
  }
  taxaDeslocamento() {
    /* TODO: regra da taxa (compare cidades ignorando acentos/maiúsculas) */
  }
}
// Fábrica: decide a classe a partir do objeto simples (necessária para restaurar do localStorage)
export function criarAgendamento(dados, catalogo) {
  /* TODO: achar o serviço pelo id; domiciliar ? new
AgendamentoDomiciliar(...) : new Agendamento(...) */
}
// CLOSURE: `contador` fica "presa" na função devolvida (sem variável global)
export function criarGeradorProtocolo(ultimo = 0) {
  let contador = ultimo;
  return function proximoProtocolo() {
    /* TODO: somar 1 e devolver "AP-0001" (dica: String(n).padStart(4, '0')) */
  };
}
