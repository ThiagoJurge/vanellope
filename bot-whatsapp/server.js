const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const axios = require("axios"); // Importando axios para fazer o POST
const fs = require("fs");

const app = express();
const server = http.createServer(app);

// Serve os arquivos estáticos da pasta 'public' para o QR Code
app.use(express.static(path.join(__dirname, "public")));

// Serve os arquivos estáticos da pasta 'build' do React
app.use(express.static(path.join(__dirname, "../vanellope/dist")));

// Redireciona todas as requisições para o React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../vanellope/dist", "index.html"));
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend React
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const client = new Client({
  authStrategy: new LocalAuth(), // Salva a sessão do WhatsApp
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  client.on("qr", (qr) => {
    console.log("QR Code gerado, enviando...");

    // Salva o QR Code como imagem no diretório 'public' (pasta acessível publicamente)
    const filePath = path.join(__dirname, "../vanellope/dist", "qrcode.png");

    // Gera e salva o QR Code como imagem
    qrcode.toFile(filePath, qr, (err) => {
      if (err) {
        console.error("Erro ao gerar o QR Code:", err);
        return;
      }
      // Envia a URL para o React
      socket.emit("qr", "/qrcode.png");
    });
  });

  client.on("ready", () => {
    console.log("🔥 Bot conectado!");
    socket.emit("ready", "Bot conectado!");
  });

  client.on("message", (message) => {
    console.log("Mensagem recebida:", message.body);

    // Verifica se a mensagem não é vazia e se não é uma resposta automática
    if (message.body.trim()) {
      const sender = message.from;
      const msg = message.body;

      // Envia a mensagem para o seu webhook
      axios
        .post("https://nindo.vercel.app/webhook", {
          query: {
            groupParticipant: sender,
            message: msg,
          },
        })
        .then((response) => {
          console.log("Resposta do webhook:", response.data);

          // Verifica se o webhook retornou uma resposta válida
          if (
            response.data &&
            response.data.replies &&
            response.data.replies.length > 0
          ) {
            const replyMessage = response.data.replies[0].message;

            // Só envia a mensagem se ela tiver conteúdo
            if (replyMessage.trim()) {
              message.reply(replyMessage); // Responde a mensagem no WhatsApp
            } 
          }
        })
        .catch((error) => {
          console.error("Erro ao enviar para o webhook:", error);
        });
    }
  });
});

client.initialize();

server.listen(5000, () => {
  console.log("✅ Servidor rodando em http://localhost:5000");
});
