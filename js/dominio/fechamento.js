import { Agendamento, AgendamentoDomiciliar } from "./agendamento.js";

export function fecharDia(agenda, data) {
  // Seleciona os atendimentos da data informada.
  const atendimentos = agenda.filter(
    (agendamento) => agendamento.data === data,
  );

  // Separa os atendimentos concluídos.
  const concluidos = atendimentos.filter(
    (agendamento) => agendamento.status === "Concluído",
  );

  // Calcula o faturamento dos atendimentos concluídos.
  const faturamento = concluidos.reduce((total, agendamento) => {
    const instancia = agendamento.domiciliar
      ? new AgendamentoDomiciliar(agendamento)
      : new Agendamento(agendamento);

    return total + instancia.calcularValor();
  }, 0);

  // Conta quantos atendimentos existem para cada serviço.
  const quantidadePorServico = atendimentos.reduce((resultado, agendamento) => {
    const servico = agendamento.servicoNome || "Não informado";

    resultado[servico] = (resultado[servico] || 0) + 1;

    return resultado;
  }, {});

  // Conta os atendimentos cancelados.
  const cancelados = atendimentos.filter(
    (agendamento) => agendamento.status === "Cancelado",
  ).length;

  // Ordena os atendimentos agendados por horário.
  const proximos = atendimentos
    .filter((agendamento) => agendamento.status === "Agendado")
    .sort((a, b) => a.hora.localeCompare(b.hora));

  // Localiza o próximo atendimento.
  const proximoAtendimento = proximos.find(
    (agendamento) => agendamento.status === "Agendado",
  );

  // Percorre os atendimentos para contar o total.
  let totalAtendimentos = 0;

  for (const atendimento of atendimentos) {
    totalAtendimentos += 1;
  }

  return {
    data,
    totalAtendimentos,
    faturamento,
    quantidadePorServico,
    cancelados,
    proximoAtendimento: proximoAtendimento || null,
  };
}
