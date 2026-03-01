const http = require('http');
const axios = require('axios');
const fs = require('fs');

// --- 1. IMPORTACIÓN DE LA ANTENA DIRECTA ---
const { enviar_telegram } = require('./notificador'); 

// --- 2. PARCHE FANTASMA PARA RENDER ---
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => { 
    res.writeHead(200, {'Content-Type': 'text/plain'}); 
    res.end('Centinela 548: Francotirador Activo, Blindado y Temporalmente Consciente'); 
}).listen(PORT, () => {
    console.log(`==> Servidor activo en puerto ${PORT}. Sin interferencias.`);
});

// --- 3. IDENTIDAD Y VARIABLES ---
const groqApiKey = process.env.GROQ_API_KEY;

console.log("==> Iniciando Secuencia de Arranque Centinela 548 (Modo Francotirador Blindado)...");

// Disparo de prueba 
enviar_telegram("🔌 <b>Protocolo 548:</b> Modo Francotirador activado. Sentido del tiempo inyectado. Mente estricta en línea.");

// --- 4. MEMORIA DE ERRORES (Modo Estático) ---
const archivoMemoria = 'memoria_errores.json';
let memoriaErrores = [];
if (fs.existsSync(archivoMemoria)) {
    memoriaErrores = JSON.parse(fs.readFileSync(archivoMemoria, 'utf8'));
} else {
    fs.writeFileSync(archivoMemoria, JSON.stringify([]));
}

// --- 5. EL CEREBRO DE LA IA (GROQ) CON MENTE DRACONIANA ---
async function consultarOraculoIA(datosDelToken) {
    try {
        const contextoErrores = memoriaErrores.slice(-5).map(e => `Fallo: ${e.motivo}`).join(" | ");
        const promptSystem = `Eres un trader experto de la élite y auditor de contratos en Solana. No haces scalping. 
        Analiza estos datos del token: ${JSON.stringify(datosDelToken)}. 
        Evalúa estrictamente: 1. Volumen. 2. Liquidez. 3. No estafa. 4. Ballenas. 5. SENTIDO DEL TIEMPO (revisa cambio_5m y cambio_1h para saber si está en la punta de una vela inflada o si es un buen momento).
        
        ERRORES RECIENTES DEL MERCADO: [${contextoErrores}]. Si hay similitudes, rechaza de inmediato.
        
        SI Y SOLO SI cumple absolutamente todo y tiene un Mcap de 30k a 100k, ESTÁS ESTRICTAMENTE OBLIGADO a responder ÚNICA Y EXCLUSIVAMENTE con este formato exacto (SIN viñetas, SIN saludos, SIN pensar en voz alta):
        
        luz verde dispara, es el momento, aquí la elite está concentrando energía, próximamente se verán los movimientos.
        🎯 TÁCTICA DE ENTRADA: [Escribe "ESPERA EL DIP, ha subido demasiado rápido" si los porcentajes de 5m/1h son muy altos, o "ENTRA AHORA (MARKET), la corrección es saludable" si el precio está estable o en retroceso].
        
        Si hay la más mínima duda o peligro, tu ÚNICA respuesta debe ser "RECHAZADO" seguido de 1 sola oración con el motivo.`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: promptSystem },
                { role: "user", content: "Analiza esta gema, aplica el sentido del tiempo y dame el veredicto directo." }
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
        const detalleError = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
        console.error("🚨 Interferencia exacta en el Oráculo IA:", detalleError);
        return "ERROR_IA";
    }
}

// --- 6. EL CAZADOR AUTOMÁTICO ---
const tokensAnalizados = new Set();

async function cazarGemas() {
    try {
        console.log("🔍 Escaneando la blockchain, buscando liquidez en Raydium...");
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

                if (mCap >= 30000 && mCap <= 100000 && liquidez > 5000) {
                    console.log(`🔥 Gema encontrada: ${pairData.baseToken.symbol} | Mcap: $${mCap.toLocaleString()}`);
                    
                    // INYECTAMOS LOS DATOS DE TIEMPO (M5 y H1) AL CEREBRO DE LA IA
                    const analisisIA = await consultarOraculoIA({
                        nombre: pairData.baseToken.name, 
                        simbolo: pairData.baseToken.symbol,
                        mCap_USD: mCap, 
                        liquidez_USD: liquidez, 
                        volumen_24h: pairData.volume.h24,
                        cambio_5m: pairData.priceChange?.m5 || 0, // Variación en los últimos 5 mins
                        cambio_1h: pairData.priceChange?.h1 || 0  // Variación en la última hora
                    });

                    // BLINDAJE REGEX ACTIVADO
                    if (/luz verde dispara/i.test(analisisIA)) {
                        const mensajeFinal = `🟢 <b>SEÑAL DE ALTA PRECISIÓN</b> 🟢\n\n` +
                                             `🏷️ <b>Nombre:</b> ${pairData.baseToken.name} (${pairData.baseToken.symbol})\n` +
                                             `📜 <b>CA:</b> <code>${tokenAddress}</code>\n\n` +
                                             `💰 <b>Market Cap:</b> $${mCap.toLocaleString()}\n` +
                                             `💧 <b>Liquidez:</b> $${liquidez.toLocaleString()}\n\n` +
                                             `🧠 <b>Análisis Táctico:</b>\n${analisisIA}\n\n` +
                                             `📊 <a href="https://dexscreener.com/solana/${tokenAddress}">Ver Gráfico y Comprar</a>`;
                        
                        enviar_telegram(mensajeFinal);
                    } else if (analisisIA !== "ERROR_IA") {
                        console.log(`❌ Rechazado: ${pairData.baseToken.symbol} - ${analisisIA.substring(0, 50)}...`);
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
    } catch (error) {
        console.error("Interferencia en el rastreo del mercado:", error.message);
    }
}

setInterval(cazarGemas, 5 * 60 * 1000);
cazarGemas();
