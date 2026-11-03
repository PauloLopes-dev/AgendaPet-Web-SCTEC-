import { describe, it, expect } from "vitest";

import {
  Agendamento,
  AgendamentoDomiciliar,
  criarGeradorProtocolo,
} from "../js/dominio/agendamento.js";

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
});
