const axios = require('axios');

const enviarMensagemWebhook = async (message) => {
  try {
    const response = await axios.post("https://nindo.vercel.app/webhook", {
      query: {
        groupParticipant: message.author,
        message: message.body,
      },
    });

    if (response.data?.replies?.length > 0) {
      return response.data.replies[0].message.trim();
    }
    return null;
  } catch (error) {
    console.error("Erro ao enviar mensagem para o webhook:", error.message);
    return null;
  }
};

module.exports = { enviarMensagemWebhook };
