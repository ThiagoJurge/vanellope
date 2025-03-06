const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const cron = require("node-cron");
const { obterClima } = require("./clima");
const { enviarMensagemWebhook } = require("./webhook");
const { startServer } = require("./server");
const { realizarSorteio } = require("../modules/randomItem");
const { mentionAll } = require("../modules/mentionAll");
const { returnAvaliacao } = require("../modules/returnAvaliacao");
const { wordCounter } = require("../modules/wordCounter");

// Constantes para IDs de grupos
const GROUP_IDS = {
  SORTEIOS_E_TESTES: "120363388895811072@g.us",
  ADMINISTRACAO: "120363385517847817@g.us",
  SISTEMAS: "120363368764911804@g.us",
  RECRUTAMENTO: "120363390253263715@g.us",
  LOJA: "120363389786177238@g.us",
  SORTEIOS: "120363373094166284@g.us",
  AVALIACOES: "120363379966676777@g.us",
  COMENTARIOS: "120363407582256633@g.us",
  MUNDO_NINJA: "120363388725767072@g.us",
  CLIMA: "120363370922999992@g.us",
};

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    });

    this.allowedGroups = Object.values(GROUP_IDS);

    this.initialize();
  }

  initialize() {
    this.client.on("qr", this.handleQR.bind(this));
    this.client.on("ready", this.handleReady.bind(this));
    this.client.on("message", this.handleMessage.bind(this));
    this.client.initialize();
    startServer(this.client); // Start the server
  }

  handleQR(qr) {
    console.log("📌 QR Code gerado. Escaneie para conectar-se ao bot.");
    qrcode.toString(qr, { type: "terminal", small: true }, (err, qrCode) => {
      if (err) {
        console.error("❌ Erro ao gerar QR Code:", err);
      } else {
        console.log(qrCode);
      }
    });
  }

  handleReady() {
    console.log("🚀 Bot do WhatsApp está online e pronto para uso!");
    cron.schedule("0 6,12,18,0 * * *", () => {
      console.log("⏰ Enviando clima para as vilas...");
      this.enviarClima();
    });
  }

  async handleMessage(message) {
    if (message.author && this.allowedGroups.includes(message.from)) {
      console.log(`📩 Mensagem recebida de ${message.from}: ${message.body}`);

      if (!message.body.trim()) return;

      await returnAvaliacao(this.client, message);

      if (message.body.startsWith("/contar")) {
        wordCounter(this.client, message);
      }

      if (message.from === GROUP_IDS.ADMINISTRACAO) {
        const sorteioResposta = realizarSorteio();
        if (sorteioResposta) {
          message.reply(sorteioResposta);
        }
      }

      if (message.body.trim().toLowerCase() === "/todos") {
        const chat = await message.getChat();
        await mentionAll(chat, message);
        return;
      }

      if (message.body.trim().toLowerCase() === "!clima") {
        console.log("⛅ Comando de clima recebido! Enviando previsão...");
        await this.enviarClima(message.from);
        return;
      }
      if (
        message.from === GROUP_IDS.SISTEMAS ||
        message.from === GROUP_IDS.ADMINISTRACAO ||
        message.from === GROUP_IDS.RECRUTAMENTO ||
        message.from === GROUP_IDS.SORTEIOS_E_TESTES ||
        message.from === GROUP_IDS.LOJA
      ) {
        const responseMessage = await enviarMensagemWebhook(
          message,
          this.client
        );
        if (responseMessage) {
          console.log(`💬 Respondendo para: ${message.from}`);
          await this.client.sendMessage(message.from, responseMessage);
        }
      }
    } else {
      console.log("Grupo não autorizado:", message.from);
    }
  }

  async enviarClima() {
    try {
      const mensagem = obterClima();
      await this.client.sendMessage(GROUP_IDS.CLIMA, mensagem);
      console.log("✅ Clima enviado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao enviar clima:", error.message);
    }
  }
}

module.exports = WhatsAppBot;
