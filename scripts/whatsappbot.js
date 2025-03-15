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
  RECRUTAMENTO: "120363368764911804@g.us",
  SISTEMAS: "120363390253263715@g.us",
  LOJA: "120363389786177238@g.us",
  SORTEIOS: "120363373094166284@g.us",
  AVALIACOES: "120363379966676777@g.us",
  COMENTARIOS: "120363407582256633@g.us",
  MUNDO_NINJA: "120363388725767072@g.us",
  CLIMA: "120363370922999992@g.us",
  OFF: "120363387100655223@g.us",
};

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-extensions",
          "--disable-gpu",
          "--disable-software-rasterizer",
        ],
        timeout: 60000, // 60 segundos
      },
    });

    this.allowedGroups = Object.values(GROUP_IDS);

    this.initialize();
  }

  initialize() {
    this.client.on("qr", this.handleQR.bind(this));
    this.client.on("ready", this.handleReady.bind(this));
    this.client.on("message", this.handleMessage.bind(this));
    this.client.on("group_join", this.handleGroupJoin.bind(this));
    this.client.on("group_leave", this.handleGroupLeave.bind(this));
    this.client.on("disconnected", (reason) => {
      console.log(`Cliente foi desconectado: ${reason}`);
      setTimeout(() => {
        console.log("Tentando reconectar...");
        this.client.initialize();
      }, 5000);
    });

    this.client.on("error", (err) => {
      console.error("Erro detectado:", err);
    });

    this.client.initialize();
    startServer(this.client);
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

      if (message.body.toLowerCase() === "/aprovado" && message.hasQuotedMsg) {
        console.log("🛠️ Comando /aprovado detectado");
        const chat = await message.getChat();
        const quotedMsg = await message.getQuotedMessage();

        // Verifica se o autor do comando é admin
        const isAdmin = await this.isUserAdmin(chat, message.author);
        if (!isAdmin) {
          message.reply("❌ *Apenas administradores podem usar esse comando.*");
          return;
        }

        // Obtém o autor da mensagem mencionada e converte para o formato @c.us
        let targetUser = quotedMsg.author?.replace("@g.us", "@c.us");

        if (!targetUser) {
          message.reply("⚠️ Não foi possível identificar o autor da mensagem.");
          return;
        }

        console.log(`🎯 Tentando enviar mensagem privada para: ${targetUser}`);

        try {
          // Envia mensagem privada para o usuário
          await this.client.sendMessage(
            targetUser,
            "✅ *Parabéns!* Sua ficha foi aprovada!"
          );
          await this.client.sendMessage(
            targetUser,
            `📄 *Sua ficha:* \n\n${quotedMsg.body}`
          );
          await this.client.sendMessage(
            targetUser,
            `🎉 Seja muito bem-vindo(a)! Qualquer dúvida, pode contatar a administração.`
          );
          await this.client.sendMessage(
            targetUser,
            `🤖 Sou apenas um bot, então provavelmente eu não vá te responder.`
          );
          await this.client.sendMessage(
            targetUser,
            `ℹ️ Não temos grupo de fichas! Então, em breve, a Bibi irá te encaminhar seu link para atualizar a ficha. Se demorar demais, pode nos cobrar.`
          );

          console.log(`✅ Mensagem privada enviada para ${targetUser}`);
        } catch (error) {
          console.log(
            `❌ Erro ao enviar mensagem para ${targetUser}: ${error.message}`
          );
          message.reply(`❌ Erro ao enviar mensagem para o usuário.`);
          return;
        }

        // Grupos de destino (confirme que o bot é admin em todos eles)
        const DESTINATION_GROUPS = [
          GROUP_IDS.MUNDO_NINJA,
          GROUP_IDS.SISTEMAS,
          GROUP_IDS.LOJA,
          GROUP_IDS.OFF,
        ];

        for (const groupId of DESTINATION_GROUPS) {
          try {
            console.log(
              `🔄 Tentando adicionar ${targetUser} ao grupo ${groupId}...`
            );

            // Verifica se o bot é admin no grupo antes de tentar adicionar

            const groupChat = await this.client.getChatById(groupId);
            const isBotAdmin = groupChat.participants.some(
              (participant) =>
                participant.id._serialized ===
                  this.client.info.wid._serialized && participant.isAdmin
            );

            if (!isBotAdmin) {
              console.log(
                `❌ O bot não é administrador no grupo ${groupChat.name}`
              );
              continue;
            }

            // Adiciona o usuário ao grupo
            console.log(
              await groupChat.addParticipants(targetUser, {
                sleep: [500, 1000],
                autoSendInviteV4: true,
              })
            );

            console.log(
              `✅ ${targetUser} foi adicionado ao grupo ${groupChat.name}`
            );

            // Remove o usuário do grupo atual
          } catch (error) {
            console.log(
              `❌ Erro ao adicionar no grupo ${groupId}: ${error.message}`
            );
            if (error.message.includes("not-authorized")) {
              message.reply(
                `⚠️ O WhatsApp bloqueou a adição de ${targetUser} ao grupo.`
              );
            } else {
              message.reply(
                `❌ Não foi possível adicionar o usuário em um dos grupos.`
              );
            }
          }
        }

        try {
          if (quotedMsg.author) {
            await chat.removeParticipants([quotedMsg.author]);
            console.log(`🚀 ${targetUser} foi removido do grupo ${chat.name}`);
          } else {
            console.log(
              "⚠️ Não foi possível identificar o autor da mensagem citada."
            );
          }
        } catch (error) {
          console.log(`❌ Erro ao remover o usuário: ${error.message}`);
          message.reply(`❌ Erro ao tentar remover o usuário.`);
        }

        message.reply(
          `✅ *${targetUser.replace(
            "@c.us",
            ""
          )} foi aprovado e adicionado aos grupos!*`
        );
        return "";
      }

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
      console.log(message)
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

  async isUserAdmin(chat, userId) {
    const participants = await chat.participants;
    const participant = participants.find((p) => p.id._serialized === userId);
    return participant && participant.isAdmin;
  }

  async handleGroupJoin(notification) {
    const group = await notification.getChat();
    const number = notification.id?.participant; // Garantir que o número não seja undefined
  
    // Verificar se o número foi extraído corretamente
    if (!number) {
      console.log("❌ Número do participante não encontrado!");
      return;
    }
  
    // Remover participantes do DDD +62
    if (number.startsWith("62")) {
      try {
        if (number) {
          await group.removeParticipants([number]);
          console.log(`🚫 Participante ${number} removido automaticamente por ser do DDD +62`);
        }
      } catch (error) {
        console.log(`❌ Erro ao remover o usuário ${number}: ${error.message}`);
      }
    } else {
      console.log("Novo membro no grupo:", number);
    }
  
    // Checando se o grupo é o de recrutamento ou sorteios
    if (group.id._serialized === GROUP_IDS.RECRUTAMENTO || group.id._serialized === GROUP_IDS.SORTEIOS_E_TESTES) {
      try {
        // Enviar mensagem de boas-vindas no grupo de recrutamento
        await group.sendMessage(
          `Opa! Seja bem-vindo (a) ao Nindo!\nVou te mandar o tutorial pra preencher a ficha. Está tudo muito bem explicadinho, mas, pode tirar suas dúvidas à vontade!\n\nPor questões de segurança, vou checar se você já tem algum sorteio registrado também.`
        );
        console.log(`✅ Mensagem de boas-vindas enviada para ${number}`);

        const tutorialMessage = { body: "/tutorial", from: group.id._serialized, author: number}; // Mensagem fictícia para o tutorial
        const tutorial = await enviarMensagemWebhook(tutorialMessage, this.client);
        if (tutorial) {
          console.log(`💬 Enviando tutorial para: ${number}`);
        }
  
        const sorteiosCheckMessage = { body: `/sorteios ${number}` , from: group.id._serialized, author: number}; // Mensagem fictícia para o sorteio
        const sorteios_check = await enviarMensagemWebhook(sorteiosCheckMessage, this.client);
        if (sorteios_check) {
          console.log(`💬 Enviando verificação de sorteios para: ${number}`);
        }    
      } catch (error) {
        console.log(`❌ Erro ao enviar mensagem de boas-vindas para ${number}: ${error.message}`);
      }
    }
  }
  

  async handleGroupLeave(notification) {
    console.log("Saiu nego:", notification.id.participant);
  }
}

module.exports = WhatsAppBot;
