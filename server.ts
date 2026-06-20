import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { extractProfileInfo, cleanLinkedInUrl } from "./src/utils/linkedinParser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "15mb" })); // Allow large html payloads
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Initialize Gemini API client optionally
  let ai: GoogleGenAI | null = null;
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

  if (hasGeminiKey) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API Endpoints
  app.get("/api/config", (req, res) => {
    res.json({
      hasGeminiKey,
      appName: "LinkedIn Profile ID Finder"
    });
  });

  // 1. Direct fetch endpoint - attempts to scrape with realistic headers
  app.post("/api/resolve", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "La URL de LinkedIn es requerida" });
    }

    let cleanUrl: string;
    try {
      cleanUrl = cleanLinkedInUrl(url);
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e.message });
    }

    try {
      console.log(`[RESOLVER] Intentando resolución en vivo para: ${cleanUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(cleanUrl, {
        method: "GET",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,es-ES;q=0.8,es;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle LinkedIn anti-scraping blocks (very common on server IPs, return informative response)
      if (response.status === 999 || response.status === 429 || response.status === 403 || response.redirected) {
        return res.json({
          success: false,
          rateLimited: true,
          statusCode: response.status,
          message: `Seguridad de LinkedIn denegó el acceso (Código ${response.status}). LinkedIn restringe los accesos directos desde servidores en la nube. Por favor, usa el método de Pegar Código HTML o el Bookmarklet interactivo.`
        });
      }

      if (!response.ok) {
        return res.json({
          success: false,
          rateLimited: true,
          statusCode: response.status,
          message: `La página respondió con estado: ${response.status}. Recomentamos usar Copiar/Pegar Código Fuente.`
        });
      }

      const html = await response.text();
      const extracted = extractProfileInfo(html);
      
      return res.json({
        success: extracted.success,
        data: extracted,
        method: "scr_live"
      });
    } catch (err: any) {
      console.error("[RESOLVER] Error de red en resolución en vivo:", err);
      return res.json({
        success: false,
        error: true,
        message: `Error de red de servidor: ${err.message || 'Error desconocido'}. La dirección puede estar protegida por cortafuegos o Cloudflare. Recomendamos usar el método Manual de Copiar/Pegar.`
      });
    }
  });

  // 2. Direct parsing of manually pasted HTML
  app.post("/api/parse-pasted", (req, res) => {
    const { html } = req.body;
    if (!html || typeof html !== "string") {
      return res.status(400).json({ success: false, message: "El código HTML es requerido" });
    }

    try {
      const extracted = extractProfileInfo(html);
      return res.json({
        success: extracted.success,
        data: extracted,
        method: "manual_heuristics"
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Error al analizar el código HTML: " + err.message });
    }
  });

  // 3. Smart AI-assisted extraction using Gemini 3.5 Flash (with structured response schema)
  app.post("/api/gemini-extract", async (req, res) => {
    if (!ai) {
      return res.status(400).json({
        success: false,
        noKey: true,
        message: "La clave API de Gemini no está configurada. Por favor, asegúrese de agregar GEMINI_API_KEY en Panel de Ajustes > Secrets."
      });
    }

    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ success: false, message: "El texto crudo de entrada es requerido" });
    }

    try {
      console.log(`[AI-EXTRACT] Levantando consulta con Gemini para análisis inteligente de perfil...`);
      
      // Slice input text to prevent exceeding token limits on large raw HTML files.
      // Usually the first 120,000 characters contains headers, head meta, scripts, mini profiles etc.
      const truncatedInput = rawText.slice(0, 120000);

      const prompt = `Analiza este extracto de código HTML o texto de un perfil de LinkedIn y extrae con precisión toda la información disponible.
Pon especial atención en buscar identificadores únicos que LinkedIn utiliza, tales como ids numéricos (memberId, urn:li:member:XXXXX, urn:li:person:XXXXX) or miniProfile tokens (urn:li:fs_miniProfile:XXXXX).

CÓDIGO DE ENTRADA:
${truncatedInput}

Devuelve el resultado en JSON estructurado acorde al esquema de respuesta solicitado. No inventes datos. Si no encuentras el ID, pon null.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Nombre completo de la persona en el perfil",
              },
              numericId: {
                type: Type.STRING,
                description: "Identificador numérico de miembro (p. ej. '12345678') o null si no se encuentra",
              },
              miniProfileId: {
                type: Type.STRING,
                description: "Identificador token miniProfile (p. ej. 'ACoAACYz_B8B_...' sin el prefijo urn:li:fs_miniProfile:) o null si no se encuentra",
              },
              headline: {
                type: Type.STRING,
                description: "Subtítulo profesional o titular del perfil",
              },
              location: {
                type: Type.STRING,
                description: "Ubicación geográfica listada en el perfil",
              },
              company: {
                type: Type.STRING,
                description: "Compañía actual o última institución de trabajo",
              },
              imageUrl: {
                type: Type.STRING,
                description: "URL de la foto de avatar o imagen de perfil",
              }
            },
            // propertyOrdering is optional but we can provide our required schema
            required: ["name"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se pudo obtener texto de respuesta de Gemini");
      }

      const parsedResult = JSON.parse(responseText.trim());

      // Format to fit output schema
      const resultData = {
        numericId: parsedResult.numericId || null,
        miniProfileId: parsedResult.miniProfileId || null,
        name: parsedResult.name || null,
        headline: parsedResult.headline || null,
        imageUrl: parsedResult.imageUrl || null,
        company: parsedResult.company || null,
        location: parsedResult.location || null,
        patternsMatched: [{ patternName: "Gemini AI Intelligent Analysis", value: "cognitive-schema-match" }],
        success: !!(parsedResult.numericId || parsedResult.miniProfileId || parsedResult.name)
      };

      return res.json({
        success: resultData.success,
        data: resultData,
        method: "cognitive_ai"
      });
    } catch (err: any) {
      console.error("[AI-EXTRACT] Error de extracción con Gemini:", err);
      return res.status(500).json({
        success: false,
        message: "Error de análisis de inteligencia artificial: " + err.message
      });
    }
  });

  // Vite Integration for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[🚀 SERVER] Inicializado en el host 0.0.0.0 sobre el puerto: ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[💥 CRITICAL] Fallo crítico al iniciar el servidor Express:", error);
});
