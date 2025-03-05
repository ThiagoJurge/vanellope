const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const cron = require("node-cron");
const { obterClima } = require("./clima");
const { enviarMensagemWebhook } = require("./webhook");
const { startServer } = require("./server");
const { realizarSorteio } = require("../modules/randomItem");
const { mentionAll } = require("../modules/mentionAll");
const { returnAvaliacao } = require("../modules/returnAvaliacao");

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    });

    this.allowedGroups = [
      "120363388895811072@g.us", // Sorteios e testes
      "120363385517847817@g.us", // Administração
      "120363368764911804@g.us", // Sistemas
      "120363390253263715@g.us", // Recrutamento
      "120363389786177238@g.us", // Loja
      "120363373094166284@g.us", // Sorteios
      "120363379966676777@g.us", // Avaliações
      "120363407582256633@g.us", // Comentários
      "120363388725767072@g.us", // Mundo Ninja
    ];

    this.GRUPO_CLIMA = "120363370922999992@g.us"; // Grupo clima

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
        if (message.hasQuotedMsg) {
            let quotedMsg = await message.getQuotedMessage(); // Obtém a mensagem citada (a mensagem1)
    
            if (quotedMsg && quotedMsg.body) {
                // Conta as palavras da mensagem citada
                let palavras = quotedMsg.body.match(/[a-zA-ZÀ-ÖØ-öø-ÿ0-9]+/g) || [];
                let contagem = palavras.length;
    
                // Mensagem de resposta
                let responseMessage = `${contagem} ${contagem === 1 ? "palavra" : "palavras"}.`;
    
                try {
                    // Envia a resposta mencionando a mensagem citada
                    await this.client.sendMessage(message.from, responseMessage, {
                      quotedMessageId: quotedMsg.id._serialized // Menciona a mensagem1
                  });
                    // Deleta a mensagem2 (a que contém /contar)
                    await message.delete(true);
                } catch (error) {
                    console.error("Erro ao enviar a mensagem citada:", error);
                }
    
            } else {
                this.client.sendMessage(message.from, "Uma mensagem sem nada escrito? Que peculiar.");
            }
        } else {
            this.client.sendMessage(message.from, "Marca a mensagem que você quer contar.");
        }
    }
    
      if (message.from === "120363385517847817@g.us") {
        // Realiza o sorteio
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

      const responseMessage = await enviarMensagemWebhook(message);
      if (responseMessage) {
        console.log(`💬 Respondendo para: ${message.from}`);
        await this.client.sendMessage(message.from, responseMessage);
      }
    } else {
      console.log("Grupo não autorizado:", message.from);
    }
  }

  async enviarClima() {
    try {
      const mensagem = obterClima();
      await this.client.sendMessage(this.GRUPO_CLIMA, mensagem);
      console.log("✅ Clima enviado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao enviar clima:", error.message);
    }
  }
}

module.exports = WhatsAppBot;
