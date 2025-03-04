// clima.js
const cron = require("node-cron");

const VILAS = {
  Konoha: {
    temp: [15, 25],
    umidade: [50, 70],
    condicoes: ["Ensolarado", "Parcialmente Nublado", "Chuvisco", "Chuvoso"],
  },
  Suna: {
    temp: [30, 45],
    umidade: [10, 30],
    condicoes: ["Ensolarado", "Vento Forte", "Tempestade de Areia"],
  },
  Kiri: {
    temp: [10, 20],
    umidade: [80, 100],
    condicoes: ["Nevoeiro", "Chuvoso", "Garoa"],
  },
  Kumo: {
    temp: [5, 18],
    umidade: [60, 90],
    condicoes: ["Nublado", "Trovoada", "Chuvisco"],
  },
  Iwa: {
    temp: [10, 25],
    umidade: [40, 60],
    condicoes: ["Parcialmente Nublado", "Ventania", "Tempestade"],
  },
};

// Função para gerar o clima de uma vila
function gerarClima(vila, dados) {
  const temperatura = (
    Math.random() * (dados.temp[1] - dados.temp[0]) +
    dados.temp[0]
  ).toFixed(1);
  const umidade = Math.floor(
    Math.random() * (dados.umidade[1] - dados.umidade[0]) + dados.umidade[0]
  );
  const condicao =
    dados.condicoes[Math.floor(Math.random() * dados.condicoes.length)];

  return `– ❒❧ Clima: ${vila} –
  • Temperatura: ${temperatura}°C
  • Umidade: ${umidade}%
  • Condição: ${condicao}
`;
}

// Função para gerar e retornar o clima de todas as vilas
function obterClima() {
  let mensagem = "📡 *Atualização do Clima nas Vilas*\n\n";

  for (const [vila, dados] of Object.entries(VILAS)) {
    mensagem += gerarClima(vila, dados) + "\n";
  }

  return mensagem;
}

module.exports = { obterClima };
