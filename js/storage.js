const PREFIXO = 'agendapet:';
export function lerJSON(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);        // null na 1ª visita
        return bruto === null ? padrao : JSON.parse(bruto);
    } catch {
        return padrao;                                    // JSON corrompido não derruba a página
    }
}
export function salvarJSON(chave, valor) { /* TODO: try { setItem(chave, JSON.stringify(valor)); return true } 
catch { return false } */ }
export function limparDados() {
    // TODO: pegar Object.keys(localStorage), filtrar as que começam com PREFIXO e remover só essas
}