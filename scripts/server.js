const https = require('https');
const fs = require('fs');

const startServer = (client, PORT = 7000) => {
  const options = {
    key: fs.readFileSync('./certs/private.key'),  // Caminho para a chave privada
    cert: fs.readFileSync('./certs/server.crt'),   // Caminho para o certificado SSL
    };

  const server = https.createServer(options, (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "POST" && req.url === "/webhook") {
      let body = "";
      req.on("data", (chunk) => { body += chunk.toString(); });

      req.on("end", async () => {
        const data = JSON.parse(body);
        const message = data.message;
        const grupo = "120363389786177238@g.us"; // ID do grupo

        const formattedMessage = `
          *– ❒❧ Jutsu rankeado: –*
          *• Jutsu:* ${message.title}
          *• Rank:* ${message.rank}
          *• Categoria:* ${message.classificacoes}
          *• Quantidade de Usuários:* ${message.usuarios_rpg.length}/${message.usuarios}
          *• Observações:* ${message.observacoes || "None"}
          *• Link:* ${message.link || "None"}
          • Acesse em: https://nindo.web.app`;

        try {
          await client.sendMessage(grupo, formattedMessage);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Mensagem enviada com sucesso." }));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Erro ao enviar a mensagem." }));
          console.error("Erro ao enviar a mensagem:", error);
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Rota não encontrada." }));
    }
  });

  server.listen(PORT, () => {
    console.log(`ℹ️ Servidor HTTPS rodando na porta ${PORT}`);
  });
};

module.exports = { startServer };
