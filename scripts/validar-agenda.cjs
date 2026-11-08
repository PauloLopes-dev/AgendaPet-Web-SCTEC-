const fs = require("node:fs");
const path = require("node:path");

// Caminhos dos arquivos.
const caminhoAgenda = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(__dirname, "../data/agenda-exemplo.json");

const caminhoServicos = path.join(__dirname, "../data/servicos.json");

const statusPermitidos = ["Agendado", "Concluído", "Cancelado"];
const erros = [];

// Verifica se a data existe de verdade no calendário.
function dataValida(data) {
  if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const dataObjeto = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    dataObjeto.getUTCFullYear() === ano &&
    dataObjeto.getUTCMonth() === mes - 1 &&
    dataObjeto.getUTCDate() === dia
  );
}

// Verifica o formato e o horário de funcionamento.
function horarioValido(hora) {
  if (typeof hora !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    return false;
  }

  const [horas, minutos] = hora.split(":").map(Number);
  const totalMinutos = horas * 60 + minutos;

  return (
    totalMinutos >= 480 &&
    totalMinutos <= 1080 &&
    totalMinutos % 30 === 0
  );
}

function validarAgenda() {
  let agenda;
  let servicos;

  // Lê os arquivos.
  try {
    agenda = JSON.parse(fs.readFileSync(caminhoAgenda, "utf8"));
    servicos = JSON.parse(fs.readFileSync(caminhoServicos, "utf8"));
  } catch (erro) {
    console.error("Erro ao ler os arquivos:", erro.message);
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(agenda)) {
    console.error("Erro: a agenda precisa ser uma lista de agendamentos.");
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(servicos)) {
    console.error("Erro: o arquivo de serviços precisa conter uma lista.");
    process.exitCode = 1;
    return;
  }

  const servicosPermitidos = new Set(servicos.map((servico) => servico.id));

  console.log("\n==================================");
  console.log("       VALIDAÇÃO DA AGENDA");
  console.log("==================================");
  console.log(`Arquivo: ${path.basename(caminhoAgenda)}`);
  console.log(`Agendamentos encontrados: ${agenda.length}\n`);

  // Valida os campos de cada agendamento.
  agenda.forEach((agendamento, indice) => {
    const identificador = agendamento?.protocolo || `Registro ${indice + 1}`;

    if (!agendamento || typeof agendamento !== "object" || Array.isArray(agendamento)) {
      erros.push(`${identificador}: registro inválido.`);
      return;
    }

    const camposObrigatorios = [
      "protocolo",
      "tutor",
      "pet",
      "especie",
      "servicoId",
      "data",
      "hora",
      "status",
    ];

    for (const campo of camposObrigatorios) {
      if (
        agendamento[campo] === undefined ||
        agendamento[campo] === null ||
        String(agendamento[campo]).trim() === ""
      ) {
        erros.push(`${identificador}: campo obrigatório "${campo}" não informado.`);
      }
    }

    if (agendamento.data && !dataValida(agendamento.data)) {
      erros.push(`${identificador}: data inválida (${agendamento.data}).`);
    }

    if (agendamento.hora && !horarioValido(agendamento.hora)) {
      erros.push(`${identificador}: horário inválido (${agendamento.hora}).`);
    }

    if (
      agendamento.status &&
      !statusPermitidos.includes(agendamento.status)
    ) {
      erros.push(`${identificador}: status inválido (${agendamento.status}).`);
    }

    if (
      agendamento.servicoId &&
      !servicosPermitidos.has(agendamento.servicoId)
    ) {
      erros.push(
        `${identificador}: serviço inexistente (${agendamento.servicoId}).`,
      );
    }
  });

  // Verifica conflitos entre atendimentos que não foram cancelados.
  for (let i = 0; i < agenda.length; i++) {
    const atual = agenda[i];

    if (!atual || atual.status === "Cancelado") continue;
    if (!dataValida(atual.data) || !horarioValido(atual.hora)) continue;

    for (let j = i + 1; j < agenda.length; j++) {
      const outro = agenda[j];

      if (!outro || outro.status === "Cancelado") continue;

      if (
        atual.data === outro.data &&
        atual.hora === outro.hora
      ) {
        erros.push(
          `Conflito: ${atual.protocolo || `Registro ${i + 1}`} e ${
            outro.protocolo || `Registro ${j + 1}`
          } ocupam ${atual.data} às ${atual.hora}.`,
        );
      }
    }
  }

  // Apresenta o resultado.
  if (erros.length > 0) {
    console.error("Foram encontrados problemas:\n");

    erros.forEach((erro, indice) => {
      console.error(`${indice + 1}. ${erro}`);
    });

    console.error(`\nTotal de problemas: ${erros.length}`);
    console.error("Validação reprovada.");
    process.exitCode = 1;
  } else {
    console.log("Nenhum problema encontrado.");
    console.log("Validação aprovada.");
  }

  console.log("==================================\n");
}

validarAgenda();