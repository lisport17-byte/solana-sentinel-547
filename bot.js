const http = require('http');
const axios = require('axios');
const fs = require('fs');

// --- 1. IMPORTACIÓN DE LA ANTENA DIRECTA ---
const { enviar_telegram } = require('./notificador'); 

// --- 2. PARCHE FANTASMA PARA RENDER ---
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => { 
    res.writeHead(200, {'Content-Type': 'text/plain'}); 
    res.end('Centinela 548: Francotirador + Radar 2X Activo'); 
}).listen(PORT, () => {
    console.log(`==> Servidor activo en puerto ${PORT}.`);
});

// --- 3. IDENTIDAD Y VARIABLES ---
const groqApiKey = process.env.GROQ_API_KEY;

console.log("==> Iniciando Secuencia de Arranque Centinela 548 (Con Radar de Abundancia)...");
enviar_telegram("🔌 <b>Protocolo 548:</b> Francotirador y Radar 2X en línea. Tu tiempo es tuyo, la matriz vigila.");

// --- 4. SISTEMAS DE MEMORIA ---
// 4A. Memoria de Errores (Trampas)
const archivoMemoria = 'memoria_errores.json';
let memoriaErrores = [];
if (fs.existsSync(archivoMemoria)) {
    memoriaErrores = JSON.parse(fs.readFileSync(archivoMemoria, 'utf8'));
} else {
    fs.writeFileSync(archivoMemoria, JSON.stringify([]));
}

// 4B. Memoria de Rastreo 2X (El Moonbag)
const archivoTracking = 'tracking_2x.json';
let trackingTokens = [];
if (fs.existsSync(archivoTracking)) {
    trackingTokens = JSON.parse(fs.readFileSync(archivoTracking, 'utf8'));
} else {
    fs.writeFileSync(archivoTracking, JSON.stringify([]));
}

// --- 5. EL CEREBRO DE LA IA (GROQ) ---
async function consultarOraculoIA(datosDelToken) {
    try {
        const contextoErrores = memoriaErrores.slice(-5).map(e => `Fallo: ${e.motivo}`).join(" | ");
        const promptSystem = `Eres un trader experto de la élite y auditor de contratos en Solana. No haces scalping. 
        Analiza estos datos del token: ${JSON.stringify(datosDelToken)}. 
        Evalúa estrictamente: 1. Volumen. 2. Liquidez. 3. No estafa. 4. Ballenas. 5. SENTIDO DEL TIEMPO (revisa cambio_5m y cambio_1h).
        
        ERRORES RECIENTES DEL MERCADO: [${contextoErrores}]. Si hay similitudes, rechaza de inmediato.
        REGLA VITAL: Un porcentaje alto en 5m/1h NO es motivo para rechazar, es motivo para aconsejar esperar el dip.
        
        SI Y SOLO SI cumple absolutamente todo y tiene un Mcap de 30k a 100k, ESTÁS ESTRICTAMENTE OBLIGADO a responder ÚNICA Y EXCLUSIVAMENTE con este formato exacto:
        
        luz verde dispara, es el momento, aquí la elite está concentrando energía, próximamente se verán los movimientos.
        🎯 TÁCTICA DE ENTRADA: [Escribe "ESPERA EL DIP" si los porcentajes son altos, o "ENTRA AHORA" si está estable].
        
        Si hay la más mínima duda (sin liquidez, riesgo real), responde "RECHAZADO" y 1 sola oración de motivo.`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: promptSystem },
                { role: "user", content: "Analiza esta gema y ejecuta el protocolo." }
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
        console.error("🚨 Interferencia IA.");
        return "ERROR_IA";
    }
}

// --- 6. EL RADAR DE TAKE PROFIT (NUEVO CEREBRO) ---
async function vigilarTakeProfit() {
    if (trackingTokens.length === 0) return;
    console.log(`🎯 Radar 2X: Vigilando ${trackingTokens.length} gemas en tu portafolio...`);

    for (let i = 0; i < trackingTokens.length; i++) {
        const token = trackingTokens[i];
        try {
            const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${token.ca}`;
            const dexResponse = await axios.get(dexUrl);

            if (dexResponse.data.pairs && dexResponse.data.pairs.length > 0) {
                const currentMcap = dexResponse.data.pairs[0].fdv || 0;

                // SI EL MARKET CAP SE MULTIPLICA POR 2 (100% DE GANANCIA)
                if (currentMcap >= (token.entryMcap * 2)) {
                    const mensajeVenta = `🚨 <b>¡OBJETIVO 2X ALCANZADO!</b> 🚨\n\n` +
                                         `💎 <b>Gema:</b> ${token.symbol}\n` +
                                         `📈 <b>Mcap Inicial:</b> $${token.entryMcap.toLocaleString()}\n` +
                                         `🚀 <b>Mcap Actual:</b> $${currentMcap.toLocaleString()}\n\n` +
                                         `✅ <b>ACCIÓN INMINENTE:</b> Entra a tu wallet y RETIRA TU CAPITAL INICIAL ($20) AHORA. El resto es energía libre.`;
                    
                    enviar_telegram(mensajeVenta);

                    // Lo borramos del radar para que no siga enviando el mensaje
                    trackingTokens.splice(i, 1);
                    i--; // Ajustamos el índice tras borrar
                    fs.writeFileSync(archivoTracking, JSON.stringify(trackingTokens, null, 2));
                }
            }
            // Pequeña pausa para no saturar DexScreener
            await new Promise(resolve => setTimeout(resolve, 1500)); 
        } catch (err) {
            console.error(`Error vigilando gema ${token.symbol}:`, err.message);
        }
    }
}

// Ejecutar el Radar 2X cada 3 minutos
setInterval(vigilarTakeProfit, 3 * 60 * 1000);

// --- 7. EL CAZADOR AUTOMÁTICO ---
const tokensAnalizados = new Set();

async function cazarGemas() {
    try {
        console.log("🔍 Escaneando la blockchain en busca de nuevas frecuencias...");
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
                    const analisisIA = await consultarOraculoIA({
                        nombre: pairData.baseToken.name, 
                        simbolo: pairData.baseToken.symbol,
                        mCap_USD: mCap, 
                        liquidez_USD: liquidez, 
                        volumen_24h: pairData.volume.h24,
                        cambio_5m: pairData.priceChange?.m5 || 0, 
                        cambio_1h: pairData.priceChange?.h1 || 0  
                    });

                    if (/luz verde dispara/i.test(analisisIA)) {
                        const mensajeFinal = `🟢 <b>SEÑAL DE ALTA PRECISIÓN</b> 🟢\n\n` +
                                             `🏷️ <b>Nombre:</b> ${pairData.baseToken.name} (${pairData.baseToken.symbol})\n` +
                                             `📜 <b>CA:</b> <code>${tokenAddress}</code>\n\n` +
                                             `💰 <b>Market Cap:</b> $${mCap.toLocaleString()}\n` +
                                             `💧 <b>Liquidez:</b> $${liquidez.toLocaleString()}\n\n` +
                                             `🧠 <b>Análisis Táctico:</b>\n${analisisIA}\n\n` +
                                             `📊 <a href="https://dexscreener.com/solana/${tokenAddress}">Ver Gráfico y Comprar</a>`;
                        
                        enviar_telegram(mensajeFinal);

                        // --- NUEVO: GUARDAR EN EL RADAR 2X ---
                        trackingTokens.push({
                            ca: tokenAddress,
                            symbol: pairData.baseToken.symbol,
                            entryMcap: mCap, // Guardamos el Mcap de entrada
                            fecha: new Date().toISOString()
                        });
                        fs.writeFileSync(archivoTracking, JSON.stringify(trackingTokens, null, 2));
                        console.log(`🎯 Gema ${pairData.baseToken.symbol} añadida al Radar 2X.`);
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
    } catch (error) {
        console.error("Interferencia en el rastreo:", error.message);
    }
}

setInterval(cazarGemas, 5 * 60 * 1000);
cazarGemas();
