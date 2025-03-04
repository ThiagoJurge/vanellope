// Função para realizar o sorteio
function realizarSorteio() {
    const respostas = [
      "1 Cupom Rank A",
      "1 Cupom Rank S",
      "1 Cupom de Construção",
      "1 Vale Jornada",
      "Uma bolsa com 1kk Ryos",
      "1 Vale Treino",
    ];
  
    const probabilidade = 0.0005; // Probabilidade de 0.005%
  
    const chance = Math.random();
  
    if (chance <= probabilidade) {
      const respostaEscolhida = respostas[Math.floor(Math.random() * respostas.length)];
      const respostaCompleta = `*– ❒❧ Você estava vivendo normalmente quando, de repente, acaba encontrando o item abaixo: –*\n\n- ${respostaEscolhida}\n\n⊱⋅ ─────── ⋅⊰\n\n> Que sorte, não?`;
  
      return respostaCompleta;
    }
  
    return null; // Caso a sorteio não ocorra
  }
  
  module.exports = { realizarSorteio };
  