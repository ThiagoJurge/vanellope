const axios = require("axios");

const enviarMensagemWebhook = async (message, client) => {
  if (message.body.startsWith("F0") || message.body.startsWith("/") || message.body.startsWith("S0")) {
    try {
      // Envia a mensagem temporária "Carregando..."
      const loadingMessage = await client.sendMessage(message.from, `「 ⟳ Buscando o sistema: ${message.body} ... 」`);

      // Timeout de 10s para evitar travamentos
      const source = axios.CancelToken.source();
      const timeout = setTimeout(() => source.cancel("Tempo limite atingido."), 10000);

      // Faz a requisição para o webhook
      const response = await axios.post(
        "https://nindo.vercel.app/webhook",
        {
          query: {
            groupParticipant: message.author,
            message: message.body,
          },
        },
        { cancelToken: source.token }
      );

      clearTimeout(timeout); // Cancela o timeout se a requisição for bem-sucedida

      console.log(message.body, response.data);
      console.log(response.data?.replies?.length > 0);

      // Se houver uma resposta válida, tenta editar a mensagem
      if (response.data?.replies?.length > 0) {
        const responseMessage = response.data.replies[0].message.trim();

        // Tenta editar até 3 vezes com um pequeno delay entre elas
        let editSuccess = false;
        for (let i = 0; i < 3; i++) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Atraso antes da edição
            await loadingMessage.edit(responseMessage);
            editSuccess = true;
            break; // Sai do loop se conseguir editar
          } catch (editError) {
            console.error(`Tentativa ${i + 1} falhou ao editar mensagem:`, editError.message);
          }
        }

        // Se todas as tentativas falharem, envia uma nova mensagem
        if (!editSuccess) {
          await client.sendMessage(message.from, responseMessage);
        }
      } else {
        try {
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
