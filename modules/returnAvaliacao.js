async function returnAvaliacao(client, message) {
    if (message.hasQuotedMsg && message.from === "120363379966676777@g.us") {
      const quotedMsg = await message.getQuotedMessage();
  
      // O usuário mencionado geralmente estará na lista de participantes da mensagem citada.
      const mentionedUser = quotedMsg.author; // Pega o usuário mencionado
  
      if (!mentionedUser.includes("@g.us")) {
        // Certifica que não é um grupo
        // Busca o chat do usuário mencionado (privado)
        const chat = await client.getChatById(mentionedUser);
  
        // Envia mensagem no privado da pessoa mencionada
        const mensagemCompleta = `*– ❒❧ Avaliação: –*
  
  ${quotedMsg.body}
  
  ⊱⋅ ─────── ⋅⊰
  
  *– ❒❧ Feedback: –*
  
  ${message.body}
  
  ⊱⋅ ─────── ⋅⊰
  
  > Obs.: Você tem o direito de contestar essa resposta caso não esteja de acordo. Basta entrar no grupo de avaliação.
  
  > Esse número é o bot. Ninguém vê as mensagens no privado dele, então não adianta responder por aqui.
  `;
  
        await chat.sendMessage(mensagemCompleta);
      }
    }
  }
  
  module.exports = { returnAvaliacao };
  