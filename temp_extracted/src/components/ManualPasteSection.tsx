import React, { useState } from "react";
import { Code, Sparkles, AlertCircle, Copy, Check, Terminal, Play } from "lucide-react";
import { extractProfileInfo, ExtractedProfileInfo } from "../utils/linkedinParser";

interface ManualPasteSectionProps {
  onResolutionSuccess: (data: ExtractedProfileInfo, method: string) => void;
  hasGeminiKey: boolean;
}

export function ManualPasteSection({ onResolutionSuccess, hasGeminiKey }: ManualPasteSectionProps) {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleNativeHeuristicParse = () => {
    setErrorMsg(null);
    if (!htmlContent.trim()) {
      setErrorMsg("Por favor, introduce primero algún código HTML.");
      return;
    }

    try {
      const result = extractProfileInfo(htmlContent);
      if (result.success) {
        onResolutionSuccess(result, "manual_heuristic");
      } else {
        setErrorMsg(
          "No pudimos detectar ningún ID conocido con nuestros algoritmos rápidos en este bloque. Prueba usando el método de resolución con Inteligencia Artificial."
        );
      }
    } catch (err: any) {
      setErrorMsg("Error al parsear el HTML: " + err.message);
    }
  };

  const handleGeminiAiParse = async () => {
    setErrorMsg(null);
    if (!htmlContent.trim()) {
      setErrorMsg("Por favor, introduce primero algún código HTML o texto.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gemini-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: htmlContent }),
      });

      const body = await response.json();
      if (response.ok && body.success) {
        onResolutionSuccess(body.data, "cognitive_ai");
      } else {
        setErrorMsg(body.message || "La IA no pudo detectar patrones de identificación útiles. Revisa que el código corresponda a un perfil de LinkedIn.");
      }
    } catch (err: any) {
      console.error("[GEMINI PASTE ERROR]", err);
      setErrorMsg("Error llamando a la API de Inteligencia Artificial: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 md:p-6 shadow-xl" id="manual-paste-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 text-blue-400 p-2 rounded-lg">
            <Code className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-zinc-100">
              Pegar Código Fuente HTML del Perfil
            </h3>
            <p className="text-zinc-400 text-xs font-mono">
              Resolución segura al 100% libre de restricciones de servidor
            </p>
          </div>
        </div>

        {/* AI toggle */}
        {hasGeminiKey && (
          <div className="flex bg-zinc-950 border border-zinc-805 p-0.5 rounded-lg text-xs self-start sm:self-auto font-mono">
            <button
              onClick={() => setIsAiMode(false)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                !isAiMode ? "bg-zinc-800 text-blue-300 border border-zinc-700/50" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Búsqueda Rápida
            </button>
            <button
              onClick={() => setIsAiMode(true)}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-all ${
                isAiMode ? "bg-zinc-800 text-blue-300 border border-zinc-700/50" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              IA Inteligente
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-mono text-zinc-455 block mb-1.5">
            Instrucciones: Abre el perfil en tu navegador, pulsa <kbd className="bg-zinc-800 font-sans px-1 text-zinc-200 border border-zinc-700 rounded text-[10px]">Ctrl + U</kbd> (o click derecho {'->'} Ver código fuente de página), copia todo (<kbd className="bg-zinc-800 font-sans px-1 text-zinc-200 border border-zinc-700 rounded text-[10px]">Ctrl + A</kbd>, luego <kbd className="bg-zinc-800 font-sans px-1 text-zinc-200 border border-zinc-700 rounded text-[10px]">Ctrl + C</kbd>) y pégalo abajo:
          </label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            disabled={loading}
            placeholder={
              isAiMode
                ? "Pega aquí todo el código HTML de Ver Código Fuente o un extracto con los detalles del perfil cargado para que la Inteligencia Artificial analice los metadatos y localice el ID..."
                : "Pega aquí el código HTML completo de la página de perfil público de LinkedIn para un escaneo local instantáneo..."
            }
            className="w-full h-44 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 placeholder-zinc-650 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all overflow-y-auto resize-none scrollbar-thin"
          />
        </div>

        {errorMsg && (
          <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-xs leading-relaxed animate-fade-in align-middle">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        <div className="flex justify-between items-center bg-zinc-950/40 p-3 border border-zinc-850 rounded-xl">
          <span className="text-zinc-500 text-xs hidden sm:inline font-mono">
            {htmlContent ? `Longitud: ${htmlContent.length.toLocaleString()} caracteres` : "Listo para escaneo"}
          </span>

          {isAiMode ? (
            <button
              onClick={handleGeminiAiParse}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-500/20 text-xs font-display font-semibold rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-900/20 disabled:opacity-50 font-mono"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Procesando por Modelo IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Analizar con Inteligencia Artificial</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNativeHeuristicParse}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-display font-semibold border border-blue-500/10 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-900/10 font-mono"
            >
              <Play className="w-3.5 h-3.5 text-blue-100 fill-blue-100" />
              <span>Analizar código (Heurística Local)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
