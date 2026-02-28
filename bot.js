const http = require('http');
const axios = require('axios');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// --- 1. IMPORTACIÓN DE LA ANTENA DIRECTA ---
// Así es como se importa en Node.js (JavaScript)
const { enviar_telegram } = require('./notificador'); 

// --- 2. PARCHE FANTASMA PARA RENDER ---
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => { 
    res.writeHead(200, {'Content-Type': 'text/plain'}); 
    res.end('Centinela 548: Frecuencia Activa'); 
}).listen(PORT, () => {
    console.log(`==> Servidor activo en puerto ${PORT}`);
});

// --- 3. IDENTIDAD Y VARIABLES ---
const token = process.env.TELEGRAM_TOKEN || "8728314477:AAGctXnbLibn__otWVXO1eJPNAY7_hQDcj4";
const groqApiKey = process.env.GROQ_API_KEY;

console.log("==> Iniciando Secuencia de Arranque Centinela 548...");

// --- 4. DISPARO DIRECTO DE PRUEBA ---
// Si esto llega, la comunicación está blindada
enviar_telegram("🔌 <b>Conexión a la Matrix establecida.</b> El Oráculo está en línea. Protocolo 548 activo y vigilando la luz.");

// --- 5. RECEPTOR DE COMANDOS (MODO SILENCIOSO) ---
// Mantenemos esto SOLO para escuchar tus comandos como /fallo
const bot = new TelegramBot(token, { polling: true });

// Silenciamos los errores de red de Render para mantener la consola limpia
bot.on('polling_error', () => { 
    // Silencio absoluto
}); 

// --- 6. MEMORIA DE ERRORES ---
const archivoMemoria = 'memoria_errores.json';
let memoriaErrores = [];
if (fs.existsSync(archivoMemoria)) {
    memoriaErrores = JSON.parse(fs.readFileSync(archivoMemoria, 'utf8'));
} else {
    fs.writeFileSync(archivoMemoria, JSON.stringify([]));
}

bot.onText(/\/fallo (.+) - (.+)/, (msg, match) => {
    const ca = match[1].trim();
    const motivo = match[2].trim();
    
    memoriaErrores.push({ ca, motivo, fecha: new Date().toISOString() });
    fs.writeFileSync(archivoMemoria, JSON.stringify(memoriaErrores, null, 2));
    
    // Respondemos usando tu antena directa
    enviar_telegram(`🧠 <b>Lección Aprendida:</b>\nCA: <code>${ca}</code>\nMotivo: ${motivo}\n\nLa energía ha sido recalibrada. La IA no cometerá este error.`);
});

// --- 7. EL CEREBRO DE LA IA (GROQ) ---
async function consultarOraculoIA(datosDelToken) {
    try {
        const contextoErrores = memoriaErrores.slice(-5).map(e => `Fallo: ${e.motivo}`).join(" | ");
        const promptSystem = `Eres un trader experto de la élite y auditor de contratos en Solana. No haces scalping. 
        Analiza estos datos del token: ${JSON.stringify(datosDelToken)}. 
        Evalúa estrictamente: 1. Volumen en movimiento. 2. Liquidez para cobrar profit. 3. No estafa (sin puertas traseras). 4. No hay suficientes ballenas para manipular.
        
        ATENCIÓN - ERRORES RECIENTES DEL MERCADO: [${contextoErrores}]. 
        Aprende de estos errores. Si hay similitudes, rechaza de inmediato.
        
        SI Y SOLO SI cumple absolutamente todo y tiene un Mcap de 30k a 100k, tu ÚNICA respuesta debe ser exactamente esta frase: "luz verde dispara, es el momento, aquí la elite está concentrando energía, próximamente se verán los movimientos". 
        Si hay dudas o peligro, responde "RECHAZADO" y el motivo.`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama3-70b-8192",
            messages: [
                { role: "system", content: promptSystem },
                { role: "user", content: "Analiza esta gema recién graduada y cruza los datos con nuestra memoria." }
            ],
            temperature: 0.1
        }, {
            headers: { 
                'Authorization': `Bearer ${groqApiKey}`, 
                'Content-Type': 'application/json' 
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Interferencia en el Oráculo IA:", error.message);
        return "ERROR_IA";
    }
}

// --- 8. EL CAZADOR AUTOMÁTICO (LOS OJOS DE LA ÉLITE) ---
const tokensAnalizados = new Set();

async function cazarGemas() {
    try {
        console.log("🔍 Escaneando la blockchain, buscando liquidez y graduaciones en Raydium...");
        const response = await axios.get('https://api.dexscreener.com/token-profiles/latest/v1');
        const tokensSolana = response.data.filter(t => t.chainId === 'solana');

        for (const tokenData of tokensSolana) {
            const tokenAddress = tokenData.tokenAddress;

            if (memoriaErrores.some(e => e.ca === tokenAddress)) continue;
            if (tokensAnalizados.has(tokenAddress)) continue;
            tokensAnalizados.add(tokenAddress);

            const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
            const dexResponse = await axios.get(dexUrl);

            if (dexResponse.data.pairs && dexResponse.data.pairs.length > 0) {
                const pairData = dexResponse.data.pairs[0];
                const mCap = pairData.fdv || 0;
                const liquidez = pairData.liquidity ? pairData.liquidity.usd : 0;

                // Filtro base: Mcap 30k-100k y liquidez inicial mínima
                if (mCap >= 30000 && mCap <= 100000 && liquidez > 5000) {
                    console.log(`🔥 Gema potencial encontrada: ${pairData.baseToken.symbol} | Mcap: $${mCap.toLocaleString()}`);
                    
                    const analisisIA = await consultarOraculoIA({
                        nombre: pairData.baseToken.name, 
                        simbolo: pairData.baseToken.symbol,
                        mCap_USD: mCap, 
                        liquidez_USD: liquidez, 
                        volumen_24h: pairData.volume.h24
                    });

                    // SI EL ORÁCULO DA LA LUZ VERDE
                    if (analisisIA.includes("luz verde dispara")) {
                        const mensajeFinal = `🟢 <b>SEÑAL DE ALTA PRECISIÓN</b> 🟢\n\n` +
                                             `🏷️ <b>Nombre:</b> ${pairData.baseToken.name} (${pairData.baseToken.symbol})\n` +
                                             `📜 <b>CA:</b> <code>${tokenAddress}</code>\n\n` +
                                             `💰 <b>Market Cap:</b> $${mCap.toLocaleString()}\n` +
                                             `💧 <b>Liquidez:</b> $${liquidez.toLocaleString()}\n\n` +
                                             `🧠 <b>Mensaje del Oráculo:</b>\n${analisisIA}\n\n` +
                                             `📊 <a href="https://dexscreener.com/solana/${tokenAddress}">Ver Gráfico y Comprar</a>`;
                        
                        // Disparo directo a tu Telegram saltando bloqueos
                        enviar_telegram(mensajeFinal);
                    } else {
                        console.log(`❌ Rechazado por Oráculo: ${pairData.baseToken.symbol}`);
                    }
                }
            }
            // Pausa de 2 segundos para no saturar las APIs y mantener la sincronía
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
    } catch (error) {
        console.error("Interferencia en el rastreo del mercado:", error.message);
    }
}

// Ejecutar el cazador cada 5 minutos
setInterval(cazarGemas, 5 * 60 * 1000);
cazarGemas();
