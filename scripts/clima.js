const cron = require("node-cron");

const VILAS = {
  Konoha: {
    temp: { min: 15, max: 25 },
    umidade: { min: 50, max: 70 },
    condicoes: ["Ensolarado", "Parcialmente Nublado", "Chuvisco", "Chuvoso"],
  },
  Suna: {
    temp: { min: 30, max: 45 },
    umidade: { min: 10, max: 30 },
    condicoes: ["Ensolarado", "Vento Forte", "Tempestade de Areia"],
  },
  Kiri: {
    temp: { min: 10, max: 20 },
    umidade: { min: 80, max: 100 },
    condicoes: ["Nevoeiro", "Chuvoso", "Garoa"],
  },
  Kumo: {
    temp: { min: 5, max: 18 },
    umidade: { min: 60, max: 90 },
    condicoes: ["Nublado", "Trovoada", "Chuvisco"],
  },
  Iwa: {
    temp: { min: 10, max: 25 },
    umidade: { min: 40, max: 60 },
    condicoes: ["Parcialmente Nublado", "Ventania", "Tempestade"],
  },
};

function obterEstacao() {
  const mes = new Date().getMonth() + 1;
  if (mes >= 3 && mes <= 5) return "Primavera";
  if (mes >= 6 && mes <= 8) return "Verão";
  if (mes >= 9 && mes <= 11) return "Outono";
  return "Inverno"; // Dezembro, Janeiro e Fevereiro
}

// Função para ajustar o clima com base na hora do dia e estação
function ajustarClimaPorHoraEEstacao(vila, dados) {
  const hora = new Date().getHours();
  const estacao = obterEstacao();
  
  let temperatura = (Math.random() * (dados.temp.max - dados.temp.min) + dados.temp.min).toFixed(1);
  let umidade = Math.floor(Math.random() * (dados.umidade.max - dados.umidade.min) + dados.umidade.min);
  let condicao = dados.condicoes[Math.floor(Math.random() * dados.condicoes.length)];

  // Ajustes baseados na hora do dia
  if (hora >= 6 && hora < 12) {
    // Manhã - temperatura mais baixa
    temperatura -= 2;
  } else if (hora >= 12 && hora < 18) {
    // Tarde - temperatura mais alta
    temperatura += 3;
  } else {
    // Noite - temperatura mais amena
    temperatura -= 1;
  }

  // Ajustes baseados na estação do ano
  if (estacao === "Verão") {
    temperatura += 5; // Verão mais quente
  } else if (estacao === "Inverno") {
    temperatura -= 5; // Inverno mais frio
    umidade += 10; // Maior umidade no inverno
  }

  // Ajustando a condição de clima com base em eventos sazonais
  if (estacao === "Verão" && Math.random() < 0.2) {
    condicao = "Tempestade de Areia"; // Tempestades mais comuns no verão
  }

  return {
    temperatura,
    umidade,
    condicao,
  };
}

// Função para gerar o clima de uma vila
function gerarClima(vila, dados) {
  const climaAjustado = ajustarClimaPorHoraEEstacao(vila, dados);

  return `– ❒❧ Clima: ${vila} –\n  • Temperatura: ${climaAjustado.temperatura}°C\n  • Umidade: ${climaAjustado.umidade}%\n  • Condição: ${climaAjustado.condicao}\n`;
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
