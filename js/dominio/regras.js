import { Agendamento } from "./agendamento.js";

// Verifica se existe outro agendamento ativo no mesmo dia e horário.
export function verificarConflito(agenda, novoAgendamento) {
  return agenda.some((agendamento) =>
    agendamento instanceof Agendamento
      ? agendamento.conflitaCom(novoAgendamento)
      : new Agendamento(agendamento).conflitaCom(novoAgendamento),
  );
}

// Filtra agendamentos usando uma função recebida como critério (callback).
export function filtrarAgendamentos(lista, criterio) {
  return lista.filter(criterio);
}
