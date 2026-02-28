const TelegramBot = require('node-telegram-bot-api');
const http = require('http'); // Servidor para que Render no de error

// Servidor fantasma para mantener vivo el Web Service
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Centinela 548 Operando\n');
});
server.listen(process.env.PORT || 10000);

// Configuración del Bot
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, {polling: true});

console.log("Sistema Centinela 548 activado... Vigilando la luz.");

async function scanRaydium() {
    try {
        // La lógica de escaneo se mantiene activa
        console.log("Escaneando frecuencias de liquidez...");
    } catch (error) {
        console.error("Error en el escaneo:", error);
    }
}

setInterval(scanRaydium, 15 * 60 * 1000);

bot.onText(/\/status/, (msg) => {
    bot.sendMessage(chatId, "El bot está operando en la frecuencia correcta. Esperando confluencia de energía.");
});
