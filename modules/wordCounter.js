async function wordCounter (client, message) {
    if (!message.hasQuotedMsg) {
        return client.sendMessage(message.from, "Marca a mensagem que você quer contar.");
    }

    let quotedMsg = await message.getQuotedMessage();

    if (!quotedMsg || !quotedMsg.body) {
        return client.sendMessage(message.from, "Uma mensagem sem nada escrito? Que peculiar.");
    }

    // Conta as palavras na mensagem citada
    let palavras = quotedMsg.body.match(/[a-zA-ZÀ-ÖØ-öø-ÿ0-9]+/g) || [];
    let contagem = palavras.length;
    let responseMessage = `${contagem} ${contagem === 1 ? "palavra" : "palavras"}.`;

    try {
        // Envia a resposta mencionando a mensagem citada
        await client.sendMessage(message.from, responseMessage, {
            quotedMessageId: quotedMsg.id._serialized
        });

        // Deleta a mensagem do comando
        await message.delete(true);
    } catch (error) {
        console.error("Erro ao enviar a mensagem citada:", error);
    }
}

module.exports = { wordCounter };