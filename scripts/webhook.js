const axios = require("axios");

const enviarMensagemWebhook = async (message, client) => {
  if (message.body.startsWith("F0") || message.body.startsWith("/") || message.body.startsWith("S0")) {
    try {
      // Envia a mensagem temporária "Carregando..."
      const loadingMessage = await client.sendMessage(message.from, `「 ⟳ Buscando o sistema: ${message.body} ... 」`);

      // Timeout de 10s para evitar travamentos
      const source = axios.CancelToken.source();
      const timeout = setTimeout(() => source.cancel("Tempo limite atingido."), 10000);
      
      let mensagemFormatada = message.body;

      // Expressão regular para encontrar links do Naruto Fandom na mensagem
      const urlRegex = /(https:\/\/naruto\.fandom\.com\/pt-br\/wiki\/[^\s]*)/g;

      // Formata corretamente cada URL encontrada
      mensagemFormatada = mensagemFormatada.replace(urlRegex, (url) => {
        try {
          // Decodifica caracteres especiais existentes na URL
          let decodedUrl = decodeURIComponent(url);
          
          // Substitui espaços por underscores e recodifica corretamente
          let formattedUrl = decodedUrl.replace(/\s+/g, "_");
          
          // Recodifica a URL para garantir caracteres especiais em UTF-8
          return encodeURI(formattedUrl);
        } catch (error) {
          console.error("Erro ao formatar URL:", error);
          return url; // Retorna a URL original caso algo dê errado
        }
      });




      // Faz a requisição para o webhook
      const response = await axios.post(
        "https://nindo.vercel.app/webhook",
        {
          query: {
            groupParticipant: message.author,
            message: mensagemFormatada,
          },
        },
        { cancelToken: source.token }
      );

      clearTimeout(timeout); // Cancela o timeout se a requisição for bem-sucedida

      console.log(message.body, response.data);
      console.log(response.data?.replies?.length > 0);

      // Se houver uma resposta válida, aguarda 1s antes de editar
      if (response.data?.replies?.length > 0) {
        const responseMessage = response.data.replies[0].message.trim();

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1s antes de editar
          await loadingMessage.edit(responseMessage);
        } catch (editError) {
          console.error("Erro ao editar mensagem:", editError.message);
          await client.sendMessage(message.from, responseMessage); // Se falhar, envia uma nova mensagem
        }
      } else {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1s antes de editar
          await loadingMessage.edit("⚠️ Nenhuma resposta encontrada.");
        } catch (editError) {
          await client.sendMessage(message.from, "⚠️ Nenhuma resposta encontrada.");
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem para o webhook:", error.message);
      await client.sendMessage(message.from, "❌ Erro ao processar sua mensagem. Tente novamente.");
    }
  }
};

module.exports = { enviarMensagemWebhook };
