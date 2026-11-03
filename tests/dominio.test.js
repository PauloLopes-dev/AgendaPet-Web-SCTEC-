import { describe, it, expect } from "vitest";

import {
  Agendamento,
  AgendamentoDomiciliar,
  criarGeradorProtocolo,
} from "../js/dominio/agendamento.js";

import { verificarConflito } from "../js/dominio/regras.js";
import { fecharDia } from "../js/dominio/fechamento.js";
import {
  verificarConflito,
  filtrarAgendamentos,
} from "../js/dominio/regras.js";

describe("Domínio — Agendamento", () => {
  it("calcula o valor de um atendimento normal", () => {
    const agendamento = new Agendamento({ preco: 80 });

    expect(agendamento.calcularValor()).toBe(80);
  });

  it("considera ativo um agendamento não cancelado", () => {
    const agendamento = new Agendamento({ status: "Agendado" });

    expect(agendamento.ativo).toBe(true);
  });

  it("considera inativo um agendamento cancelado", () => {
    const agendamento = new Agendamento({ status: "Cancelado" });

    expect(agendamento.ativo).toBe(false);
  });

  it("não cobra deslocamento em Joinville", () => {
    const agendamento = new AgendamentoDomiciliar({
      preco: 80,
      cidade: "JOINVILLE",
    });

    expect(agendamento.calcularValor()).toBe(80);
  });

  it("cobra R$ 20 de deslocamento em outra cidade", () => {
    const agendamento = new AgendamentoDomiciliar({
      preco: 80,
      cidade: "São Bento do Sul",
    });

    expect(agendamento.calcularValor()).toBe(100);
  });

  it("gera protocolos sequenciais", () => {
    const gerar = criarGeradorProtocolo(3);

    expect(gerar()).toBe("AP-0004");
    expect(gerar()).toBe("AP-0005");
  });

  it("identifica conflito no mesmo dia e horário", () => {
    const existente = new Agendamento({
      data: "2026-11-04",
      hora: "09:00",
    });

    const novo = new Agendamento({
      data: "2026-11-04",
      hora: "09:00",
    });

    expect(verificarConflito([existente], novo)).toBe(true);
  });

  it("permite o mesmo horário quando o anterior está cancelado", () => {
    const existente = new Agendamento({
      data: "2026-11-04",
      hora: "09:00",
      status: "Cancelado",
    });

    const novo = new Agendamento({
      data: "2026-11-04",
      hora: "09:00",
    });

    expect(verificarConflito([existente], novo)).toBe(false);
  });

  it("não identifica conflito em horários diferentes", () => {
    const existente = new Agendamento({
      data: "2026-11-04",
      hora: "09:00",
    });

    const novo = new Agendamento({
      data: "2026-11-04",
      hora: "10:00",
    });

    expect(verificarConflito([existente], novo)).toBe(false);
  });

  it("calcula o fechamento diário corretamente", () => {
    const agenda = [
      {
        data: "2026-11-04",
        hora: "09:00",
        status: "Concluído",
        preco: 80,
        servicoNome: "Banho",
      },
      {
        data: "2026-11-04",
        hora: "10:00",
        status: "Agendado",
        preco: 100,
        servicoNome: "Tosa",
      },
      {
        data: "2026-11-04",
        hora: "11:00",
        status: "Cancelado",
        preco: 60,
        servicoNome: "Banho",
      },
      {
        data: "2026-11-05",
        hora: "09:00",
        status: "Concluído",
        preco: 150,
        servicoNome: "Consulta",
      },
    ];

    const fechamento = fecharDia(agenda, "2026-11-04");

    expect(fechamento.totalAtendimentos).toBe(3);
    expect(fechamento.faturamento).toBe(80);
    expect(fechamento.cancelados).toBe(1);
    expect(fechamento.quantidadePorServico).toEqual({
      Banho: 2,
      Tosa: 1,
    });
    expect(fechamento.proximoAtendimento.hora).toBe("10:00");
  });

  it("retorna valores zerados quando não existem atendimentos na data", () => {
    const fechamento = fecharDia([], "2026-11-04");

    expect(fechamento.totalAtendimentos).toBe(0);
    expect(fechamento.faturamento).toBe(0);
    expect(fechamento.cancelados).toBe(0);
    expect(fechamento.quantidadePorServico).toEqual({});
    expect(fechamento.proximoAtendimento).toBeNull();
  });

  it("filtra agendamentos usando um callback", () => {
    const agenda = [
      { tutor: "Ana", status: "Concluído" },
      { tutor: "Carlos", status: "Agendado" },
      { tutor: "Maria", status: "Concluído" },
    ];

    const concluidos = filtrarAgendamentos(
      agenda,
      (agendamento) => agendamento.status === "Concluído",
    );

    expect(concluidos).toHaveLength(2);
    expect(concluidos[0].tutor).toBe("Ana");
    expect(concluidos[1].tutor).toBe("Maria");
  });

  it("retorna lista vazia quando nenhum agendamento atende ao critério", () => {
    const agenda = [
      { tutor: "Ana", status: "Agendado" },
      { tutor: "Carlos", status: "Cancelado" },
    ];

    const concluidos = filtrarAgendamentos(
      agenda,
      (agendamento) => agendamento.status === "Concluído",
    );

    expect(concluidos).toEqual([]);
  });

  it("gera resumo de um agendamento normal", () => {
    const agendamento = new Agendamento({
      protocolo: "AP-0001",
      pet: "Rex",
      servicoNome: "Banho",
      preco: 80,
    });

    expect(agendamento.resumo()).toBe("AP-0001 - Rex - Banho - R$ 80.00");
  });

  it("gera resumo identificando atendimento domiciliar", () => {
    const agendamento = new AgendamentoDomiciliar({
      protocolo: "AP-0002",
      pet: "Luna",
      servicoNome: "Tosa",
      preco: 80,
      cidade: "Joinville",
    });

    expect(agendamento.resumo()).toBe(
      "AP-0002 - Luna - Tosa - R$ 80.00 - Atendimento domiciliar",
    );
  });
});
