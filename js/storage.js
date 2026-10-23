const PREFIXO = "agendapet:";

export function lerJSON(chave, padrao) {
  try {
    const bruto = localStorage.getItem(`${PREFIXO}${chave}`);
    return bruto === null ? padrao : JSON.parse(bruto);
  } catch {
    return padrao;
  }
}

export function salvarJSON(chave, valor) {
  try {
    localStorage.setItem(`${PREFIXO}${chave}`, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar os dados:", erro);
    return false;
  }
}

export function limparDados() {
  try {
    const chaves = Object.keys(localStorage);

    chaves.forEach((chave) => {
      if (chave.startsWith(PREFIXO)) {
        localStorage.removeItem(chave);
      }
    });
  } catch (erro) {
    console.error("Não foi possível limpar os dados:", erro);
    return false;
  }

  return true;
}
