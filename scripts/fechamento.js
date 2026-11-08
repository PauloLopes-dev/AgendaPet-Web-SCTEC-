import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { fecharDia } from "../js/dominio/fechamento.js";

// Recebe a data informada no terminal.
const data = process.argv[2];

if (!data) {
  console.error("Informe a data. Exemplo: npm run fechamento -- 2026-11-04");
  process.exit(1);
}

// Localiza e lê o arquivo de exemplo.
const caminhoArquivo = fileURLToPath(
  new URL("../data/agenda-exemplo.json", import.meta.url),
);

try {
  const conteudo = fs.readFileSync(caminhoArquivo, "utf8");
  const agenda = JSON.parse(conteudo);

  if (!Array.isArray(agenda)) {
    throw new Error("O arquivo de agenda precisa conter uma lista de agendamentos.");
  }

  const resultado = fecharDia(agenda, data);

  console.log("\n==================================");
  console.log("       FECHAMENTO DIÁRIO");
  console.log("==================================");
  console.log(`Data: ${data}`);
  console.log(`Total de atendimentos: ${resultado.totalAtendimentos}`);
  console.log(
    `Faturamento: ${resultado.faturamento.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`,
  );
  console.log(`Cancelamentos: ${resultado.cancelados}`);

  console.log("\nQuantidade por serviço:");

  for (const [servico, quantidade] of Object.entries(
    resultado.quantidadePorServico,
  )) {
    console.log(`- ${servico}: ${quantidade}`);
  }

  console.log("\nPróximo atendimento:");

  if (resultado.proximoAtendimento) {
    const proximo = resultado.proximoAtendimento;

    console.log(`- Horário: ${proximo.hora}`);
    console.log(`- Tutor: ${proximo.tutor || "Não informado"}`);
    console.log(`- Pet: ${proximo.pet || "Não informado"}`);
    console.log(`- Serviço: ${proximo.servicoNome || "Não informado"}`);
  } else {
    console.log("Nenhum atendimento agendado.");
  }

  console.log("==================================\n");
} catch (erro) {
  console.error("Erro ao gerar fechamento:", erro.message);
  process.exit(1);
}