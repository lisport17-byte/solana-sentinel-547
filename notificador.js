const axios = require('axios');

async function enviar_telegram(mensaje) {
    // Si Render no pasa las variables, toma tus credenciales directas por defecto
    const token = process.env.TELEGRAM_TOKEN || "8728314477:AAGctXnbLibn__otWVXO1eJPNAY7_hQDcj4";
    const chatId = process.env.CHAT_ID || "716398713";
    
    if (!token || !chatId) {
        return; 
    }
    
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: mensaje,
        parse_mode: "HTML" // Permite usar negritas y formato
    };
    
    try {
        await axios.post(url, payload, { timeout: 5000 });
    } catch (error) {
        console.error(`⚠️ Error en la antena de Telegram: ${error.message}`);
    }
}

// Exportamos la función para que bot.js pueda "importarla"
module.exports = { enviar_telegram };
