async function mentionAll(chat, message) {
    if (!chat.isGroup) {
      return chat.sendMessage("Este comando só pode ser usado em grupos.");
    }
  
    // Obtém a lista de participantes e encontra o autor da mensagem
    const authorId = message.author; // O ID de quem enviou o comando
    const sender = chat.participants.find(
      (p) => p.id._serialized === authorId
    );
  
    // Verifica se o autor da mensagem é administrador
    if (!sender || (!sender.isAdmin && !sender.isSuperAdmin)) {
      return chat.sendMessage(
        "Apenas administradores podem usar este comando."
      );
    }
  
    // Filtra apenas os participantes que não são administradores
    const nonAdmins = chat.participants.filter(
      (p) => !p.isAdmin && !p.isSuperAdmin
    );
    const mentionIds = nonAdmins.map((p) => p.id._serialized); // Obtém os IDs formatados
  
    if (mentionIds.length === 0) {
      return chat.sendMessage(
        "Todos os membros do grupo são administradores."
      );
    }
  
    let mentionMessage = "- ";
    mentionIds.forEach((id) => {
      mentionMessage += `@${id.split("@")[0]} `;
    });
  
    await chat.sendMessage(mentionMessage, { mentions: mentionIds });
  }
  
  module.exports = { mentionAll };
  