const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// 1. SERVIDOR FANTASMA MEJORADO
// Usamos process.env.PORT para que Render dicte dónde escuchar
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Centinela 548: Frecuencia Activa y Vigilando\n');
});

server.listen(PORT, () => {
  console.log(`==> Servidor fantasma activo en el puerto ${PORT}`);
});

// 2. CONFIGURACIÓN DE IDENTIDAD
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, {polling: true});

console.log("==> Sistema Centinela 548 activado... Vigilando la luz.");

// 3. CORAZÓN DEL ESCÁNER (PROVISIONAL)
async function scanRaydium() {
    try {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Escaneando gemas Mcap 30k-100k en Raydium...`);
        // Aquí conectaremos la API de Groq y Helius en el siguiente paso
    } catch (error) {
        console.error("ERROR EN ESCANEO:", error.message);
    }
}

// Escaneo inicial y luego cada 15 min
scanRaydium();
setInterval(scanRaydium, 15 * 60 * 1000);

// 4. COMANDOS DE INTERACCIÓN
bot.onText(/\/status/, (msg) => {
    bot.sendMessage(chatId, "El bot está operando en la frecuencia correcta. Esperando confluencia de energía.");
});

// Captura de errores de red para evitar caídas silenciosas
bot.on('polling_error', (error) => {
    console.log("AVISO: Error de conexión con Telegram (Polling). Reintentando...");
});
