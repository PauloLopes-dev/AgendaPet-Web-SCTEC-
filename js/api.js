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
    lembretesAtivos: true,
};

async function buscarJSON(url) {
    let resposta;
    try {
        resposta = await fetch(url);                       // só REJEITA se a requisição nem chegou ao servidor
    } catch {
        throw new ErroApi('rede', 'Sem conexão.');
    }
    if (!resposta.ok) throw new ErroApi('http', `Erro HTTP ${resposta.status}`);   // 404, 500... NÃO rejeitam o 
    fetch
    return resposta.json();                              // também é uma Promise: use await
}
// ViaCEP: depois de buscarJSON, confira  if (dados.erro)  → ErroApi('nao-encontrado')   (HTTP 200 com {"erro": true })
