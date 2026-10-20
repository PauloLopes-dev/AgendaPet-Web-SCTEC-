const estado = {
    servicos: [],              // Servico[]
    agenda: [],                // Agendamento[] (e AgendamentoDomiciliar)
    dataAgenda: hojeISO(),     // dia exibido na agenda
    filtroStatus: 'todos',
    busca: '',
    expandidos: new Set(),     // protocolos com detalhes abertos
    feriado: null,             // { date, name } se a data escolhida for feriado
    gerarProtocolo: criarGeradorProtocolo(0),   // closure
    timerLembretes: null,      // id do setInterval (só pode existir UM)
    lembreteAtivos: true;
};