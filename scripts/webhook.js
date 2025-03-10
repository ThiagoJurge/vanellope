const axios = require("axios");

const enviarMensagemWebhook = async (message, client) => {
  if (message.body.startsWith("F0") || message.body.startsWith("/") || message.body.startsWith("S0")) {
    try {
      // Envia a mensagem temporária "Carregando..."
      await client.sendMessage(message.from, `「 ⟳ Buscando ... 」`);

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
      console.log(response.data?.replies != "")
      // Se houver uma resposta válida, envia a resposta
      if (response.data?.replies?.length > 0) {
        const responseMessage = response.data.replies[0].message.trim();
        
        // Se a resposta for vazia, envia uma mensagem de erro
        if (responseMessage === '') {
          await client.sendMessage(message.from, "⚠️ Sistema inexistente.");
        } else {
          await client.sendMessage(message.from, responseMessage);
        }
      } else {
        await client.sendMessage(message.from, "⚠️ Nenhuma resposta encontrada.");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem para o webhook:", error.message);
      await client.sendMessage(message.from, "❌ Erro ao processar sua mensagem. Tente novamente.");
    }
  }
};

module.exports = { enviarMensagemWebhook };
