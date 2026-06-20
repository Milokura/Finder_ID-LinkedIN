import React, { useState } from "react";
import { Check, Copy, User, Calendar, Award, Globe, HelpCircle, ChevronRight, Sparkles, RefreshCw, FileText } from "lucide-react";
import { ExtractedProfileInfo } from "../utils/linkedinParser";

interface ResolutionResultProps {
  result: ExtractedProfileInfo;
  method: string;
  onClear: () => void;
}

export function ResolutionResult({ result, method, onClear }: ResolutionResultProps) {
  const [copiedNum, setCopiedNum] = useState(false);
  const [copiedMini, setCopiedMini] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAllJson = () => {
    const jsonStr = JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        method_used: method,
        profile_data: {
          name: result.name,
          headline: result.headline,
          numericId: result.numericId,
          miniProfileId: result.miniProfileId
            ? `urn:li:fs_miniProfile:${result.miniProfileId}`
            : null,
          imageUrl: result.imageUrl,
        },
      },
      null,
      2
    );
    copyText(jsonStr, setCopiedAll);
  };

  const getMethodName = (m: string) => {
    switch (m) {
      case "scr_live":
        return "Resolución en vivo por Servidor";
      case "manual_heuristic":
        return "Heurística de Escaneo Local";
      case "cognitive_ai":
        return "Extracción Inteligente Gemini IA";
      default:
        return "Algoritmo de Extracción Heurística";
    }
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-805 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in text-zinc-100" id="resolution-result">
      {/* Header action */}
      <div className="flex justify-between items-center pb-5 border-b border-zinc-800 mb-6">
        <div>
          <span className="text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-widest block mb-0.5">
            EXTRACCIÓN COMPLETADA
          </span>
          <h3 className="text-xl font-display font-semibold">
            Resultados de Identificación de Perfil
          </h3>
        </div>
        <button
          onClick={onClear}
          className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Analizar Otro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Side: Avatar and Metadata */}
        <div className="lg:col-span-5 space-y-5 bg-zinc-950/40 p-5 rounded-xl border border-zinc-805">
          <div className="flex items-center gap-4">
            {result.imageUrl ? (
              <img
                src={result.imageUrl}
                alt={result.name || "Perfil de LinkedIn"}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-zinc-750 shadow-md bg-zinc-900"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <User className="w-8 h-8" />
              </div>
            )}
            <div>
              <h4 className="font-display font-semibold text-base text-zinc-100 leading-tight">
                {result.name || "Usuario Desconocido"}
              </h4>
              <p className="text-zinc-500 text-xs font-mono mt-1 flex items-center gap-1">
                <span>Perfil de LinkedIn Detectado</span>
              </p>
            </div>
          </div>

          {result.headline && (
            <div className="border-t border-zinc-850 pt-4">
              <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider block mb-1">
                Titular / Subtítulo Profesional
              </span>
              <p className="text-zinc-300 text-xs leading-relaxed italic">
                "{result.headline}"
              </p>
            </div>
          )}

          {/* Extraction metadata */}
          <div className="border-t border-zinc-850 pt-4 space-y-2">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider block mb-0.5">
                Método Empleado
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[11px] font-semibold rounded border border-blue-500/20 font-mono">
                {method === "cognitive_ai" && <Sparkles className="w-3 h-3 text-blue-300" />}
                {getMethodName(method)}
              </span>
            </div>

            {result.patternsMatched && result.patternsMatched.length > 0 && (
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider block mb-1">
                  Firmas Encontradas
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.patternsMatched.slice(0, 4).map((p, i) => (
                    <span
                      key={i}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded font-mono"
                      title={p.value}
                    >
                      {p.patternName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Primary Identifiers */}
        <div className="lg:col-span-7 space-y-5">
          {/* Member numeric ID block */}
          <div className="bg-zinc-950/60 rounded-xl p-5 border border-zinc-805 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-1.5 bg-blue-500/10 text-blue-400 rounded-bl font-mono text-[9px] font-semibold tracking-wider uppercase border-l border-b border-zinc-800">
              ID NUMÉRICO
            </div>
            
            <span className="text-xs font-mono text-zinc-400 block mb-1 font-semibold">
              LinkedIn Member ID (Estable)
            </span>

            {result.numericId ? (
              <div className="flex items-center justify-between gap-4 mt-2">
                <span className="text-2xl md:text-3xl font-mono font-bold text-white tracking-wider select-all">
                  {result.numericId}
                </span>
                <button
                  onClick={() => copyText(result.numericId!, setCopiedNum)}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 hover:text-blue-400 text-zinc-300 rounded-lg border border-zinc-800 transition-colors flex-shrink-0"
                  title="Copiar ID numérico"
                >
                  {copiedNum ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="text-zinc-500 text-xs italic mt-2 py-1">
                No presente en el código fuente directo de esta sección de perfil. Use el ID alternativo de MiniProfile o consulte la resolución recursiva por Marcador.
              </div>
            )}
            <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
              El id numérico es la clave persistente de LinkedIn. Permite identificar al miembro de forma unívoca en consultas de API de bajo nivel, independientemente de que cambien su URL pública personalizada.
            </p>
          </div>

          {/* MiniProfile ID block */}
          <div className="bg-zinc-950/60 rounded-xl p-5 border border-zinc-805 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-1.5 bg-blue-500/10 text-blue-400 rounded-bl font-mono text-[9px] font-semibold tracking-wider uppercase border-l border-b border-zinc-800">
              MINIPROFILE
            </div>

            <span className="text-xs font-mono text-zinc-400 block mb-1 font-semibold">
              ID URN MiniProfile (Único)
            </span>

            {result.miniProfileId ? (
              <div className="flex items-center justify-between gap-3 mt-2">
                <span className="text-sm md:text-base font-mono font-semibold text-zinc-200 tracking-tight block truncate select-all">
                  urn:li:fs_miniProfile:{result.miniProfileId}
                </span>
                <button
                  onClick={() => copyText(`urn:li:fs_miniProfile:${result.miniProfileId}`, setCopiedMini)}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 hover:text-blue-400 text-zinc-300 rounded-lg border border-zinc-800 transition-colors flex-shrink-0"
                  title="Copiar URN completa"
                >
                  {copiedMini ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="text-zinc-500 text-xs italic mt-2 py-1">
                No presente en el código fuente analizado.
              </div>
            )}
            <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
              La URN miniProfile es un ID extendido (base64 token) que se asocia a la sesión del usuario para almacenar información resumida de tarjetas flotantes. Sirve como parámetro identificador estable.
            </p>
          </div>

          {/* Export section */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={copyAllJson}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 text-zinc-200 hover:text-white transition-all shadow-sm font-mono"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Estructura Copiada!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Copiar JSON Técnico para APIs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
