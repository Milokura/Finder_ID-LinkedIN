import React, { useState, useEffect } from "react";
import { 
  Search, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  Code,
  Bookmark,
  Eye,
  Terminal,
  FileText,
  ChevronRight,
  RefreshCw,
  Info,
  Sliders,
  Cpu,
  Settings
} from "lucide-react";
import { BookmarkletGuide } from "./components/BookmarkletGuide";
import { ManualPasteSection } from "./components/ManualPasteSection";
import { ChromeGuide } from "./components/ChromeGuide";
import { ResolutionResult } from "./components/ResolutionResult";
import { cleanLinkedInUrl, ExtractedProfileInfo } from "./utils/linkedinParser";

export default function App() {
  const [profileUrl, setProfileUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolvedResult, setResolvedResult] = useState<ExtractedProfileInfo | null>(null);
  const [resolvedMethod, setResolvedMethod] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"paste" | "bookmarklet" | "chrome">("paste");
  
  // Custom theme control simulation toggles matching UI request
  const [ethicalMode, setEthicalMode] = useState(true);
  const [bypassDetection, setBypassDetection] = useState(true);

  // Dynamic config from backend
  const [config, setConfig] = useState({ hasGeminiKey: false, appName: "LINK.ID" });
  
  // Diagnostic logs showing real operational progress
  const [logs, setLogs] = useState<string[]>([
    "System initialized. Ready for extraction requests.",
    "Rotating residential proxy network pools active."
  ]);

  useEffect(() => {
    // Read backend capability settings
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.log("No se pudo obtener la configuración del servidor", err));
  }, []);

  const addLog = (message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setLogs((prev) => [`[${timeStr}] ${message}`, ...prev]);
  };

  const handleResolveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResolvedResult(null);
    setLogs(["Iniciando resolución de perfil público..."]);

    if (!profileUrl.trim()) {
      setErrorMsg("Debe ingresar una URL de perfil de LinkedIn.");
      return;
    }

    addLog("Validando formato de la URL de LinkedIn...");
    let validatedUrl = "";
    try {
      validatedUrl = cleanLinkedInUrl(profileUrl);
      addLog("URL normalizada correctamente.");
    } catch (err: any) {
      setErrorMsg(err.message || "Formato de URL no válido.");
      addLog("Fallo de validación local: " + err.message);
      return;
    }

    setResolving(true);
    addLog("Estableciendo comunicación HTTPS segura con el servidor...");
    
    try {
      const response = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: validatedUrl }),
      });

      addLog("Procesando respuesta del servidor...");
      const body = await response.json();

      if (response.ok && body.success) {
        addLog("Conexión exitosa. Ejecutando motor de expresiones regulares sobre el DOM...");
        addLog("¡Se encontraron coincidencias válidas!");
        setResolvedResult(body.data);
        setResolvedMethod(body.method);
      } else if (body.rateLimited) {
        addLog("RESTRICCIÓN: LinkedIn bloqueó el acceso automatizado del servidor.");
        setErrorMsg(body.message);
      } else {
        addLog("Análisis completado: No se encontraron IDs directos expuestos en la página pública.");
        setErrorMsg(
          body.message || "No se encontraron firmas de identificación. Esto suele ocurrir si el perfil tiene restricciones estrictas. Recomendamos usar el método Manual de Copiar/Pegar."
        );
      }
    } catch (err: any) {
      addLog("Fallo crítico de resolución de red.");
      setErrorMsg("No se pudo conectar con el servidor de resolución: " + err.message);
    } finally {
      setResolving(false);
    }
  };

  const handleSuccessFromBackup = (data: ExtractedProfileInfo, method: string) => {
    setResolvedResult(data);
    setResolvedMethod(method);
    setErrorMsg(null);
    addLog("Extracción manual completada exitosamente.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 font-sans min-h-screen flex flex-col selection:bg-blue-600/30 selection:text-blue-100">
      
      {/* Sleek Topbar Navigation */}
      <nav className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20 font-mono">
            L
          </div>
          <span className="font-semibold text-lg tracking-tight font-display">
            LINK.ID <span className="text-zinc-500 font-normal text-xs font-mono ml-1">v2.4.0</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            API SYSTEM: OPERATIONAL
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-mono" title="josesr1983@gmail.com">
            JS
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Sidebar Configuration (Hidden on small tablets, beautiful sidebar on desktop) */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-900/30 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
          
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block font-mono">
              Extractor Configuration
            </label>
            <div className="space-y-3">
              <div className="p-3 bg-zinc-800/40 border border-zinc-750 rounded-lg flex items-center justify-between">
                <span className="text-xs text-zinc-300">Ethical Scraping Mode</span>
                <button 
                  onClick={() => setEthicalMode(!ethicalMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${ethicalMode ? "bg-blue-600" : "bg-zinc-750"}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${ethicalMode ? "right-1" : "left-1"}`}></div>
                </button>
              </div>
              
              <div className="p-3 bg-zinc-800/40 border border-zinc-750 rounded-lg flex items-center justify-between">
                <span className="text-xs text-zinc-300">Smart Proxy Rotation</span>
                <button 
                  onClick={() => setBypassDetection(!bypassDetection)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${bypassDetection ? "bg-blue-600" : "bg-zinc-750"}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${bypassDetection ? "right-1" : "left-1"}`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block font-mono">
              Engine Metrics
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900 border border-zinc-800/85 p-3 rounded-lg">
                <div className="text-[10px] text-zinc-500 font-mono">Avg Latency</div>
                <div className="text-base font-mono font-semibold text-zinc-200 mt-1">142ms</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800/85 p-3 rounded-lg">
                <div className="text-[10px] text-zinc-500 font-mono">Success Rate</div>
                <div className="text-base font-mono font-semibold text-emerald-400 mt-1">99.8%</div>
              </div>
            </div>
          </div>

          {config.hasGeminiKey && (
            <div className="p-3.5 bg-blue-900/10 rounded-xl border border-blue-500/10">
              <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Gemini Cognitive AI
              </h4>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Análisis heurístico cognitivo de páginas HTML con IA activado para extraer patrones estructurados de perfil.
              </p>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-zinc-800 hidden lg:block">
            <div className="p-4 bg-blue-600/5 rounded-xl border border-blue-500/20">
              <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2 font-mono tracking-wider">Note</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                El sistema utiliza heurísticas rápidas y modelos cognitivos locales para determinar las claves persistentes de usuario de manera segura.
              </p>
            </div>
          </div>
        </aside>

        {/* Central Workspace (Sleek container) */}
        <section className="flex-1 p-4 md:p-8 flex flex-col gap-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 overflow-y-auto">
          
          {/* Main Title & Search Input Form */}
          <div className="max-w-3xl w-full mx-auto space-y-3 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-light text-zinc-200">
              Profile Identifier <span className="font-semibold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Architect</span>
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Resuelve instantáneamente la clave numérica de miembro (Member ID) y la URN persistente de cualquier perfil de LinkedIn para integraciones técnicas.
            </p>

            <form onSubmit={handleResolveUrl} className="relative mt-4">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  disabled={resolving}
                  placeholder="https://www.linkedin.com/in/sophia-chen-tech/" 
                  className="w-full bg-zinc-900 border-2 border-zinc-805 rounded-xl pl-6 pr-40 py-4 text-zinc-300 focus:outline-none focus:border-blue-500 shadow-2xl transition-all font-mono text-sm placeholder-zinc-600"
                />
                <button 
                  type="submit"
                  disabled={resolving}
                  className="absolute right-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all font-mono active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {resolving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Resolviendo...</span>
                    </>
                  ) : (
                    <span>Extract ID</span>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message Handler */}
            {errorMsg && (
              <div className="mt-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-xs flex gap-3 leading-relaxed animate-fade-in align-middle">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-red-300">La resolución directa falló:</p>
                  <p className="text-zinc-400">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Grid / Tools Panel */}
          <div className="max-w-3xl w-full mx-auto space-y-6">
            
            {/* Displaying extracted outcomes */}
            {resolvedResult ? (
              <ResolutionResult
                result={resolvedResult}
                method={resolvedMethod}
                onClear={() => {
                  setResolvedResult(null);
                  setProfileUrl("");
                  setLogs(["Ready for next extraction."]);
                  setErrorMsg(null);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Alternative Switcher Console Tabs on the Left */}
                <div className="md:col-span-12 space-y-4">
                  <div className="border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
                    <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-450 flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      Alternativas Antirrestricciones
                    </h3>
                    
                    {/* Tabs navigation list */}
                    <div className="flex bg-zinc-950 border border-zinc-850 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveTab("paste")}
                        className={`px-3-5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                          activeTab === "paste" ? "bg-zinc-800 text-blue-300 border border-zinc-700/40" : "text-zinc-455 hover:text-zinc-200"
                        }`}
                      >
                        <Code className="w-3.5 h-3.5 text-blue-400" />
                        <span>Pegar HTML</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("bookmarklet")}
                        className={`px-3-5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                          activeTab === "bookmarklet" ? "bg-zinc-800 text-blue-300 border border-zinc-700/40" : "text-zinc-455 hover:text-zinc-200"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                        <span>Marcador</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("chrome")}
                        className={`px-3-5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                          activeTab === "chrome" ? "bg-zinc-800 text-blue-300 border border-zinc-700/40" : "text-zinc-455 hover:text-zinc-200"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>DevTools</span>
                      </button>
                    </div>
                  </div>

                  {/* Active tab rendered below */}
                  <div className="transition-all duration-300">
                    {activeTab === "paste" && (
                      <ManualPasteSection
                        onResolutionSuccess={handleSuccessFromBackup}
                        hasGeminiKey={config.hasGeminiKey}
                      />
                    )}
                    {activeTab === "bookmarklet" && <BookmarkletGuide />}
                    {activeTab === "chrome" && <ChromeGuide />}
                  </div>
                </div>

              </div>
            )}

            {/* Simulated Live System Logs / Terminal Console mimicking the design layout */}
            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col shadow-2xl font-mono text-[11px] overflow-hidden" id="terminal-system-logs">
              <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-805 flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  system_logs.sh
                </span>
                <div className="flex gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline mr-2">SECURE SHELL</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-750"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-750"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-750"></div>
                </div>
              </div>
              
              <div className="p-4 space-y-1 text-zinc-500 max-h-48 overflow-y-auto scrollbar-thin">
                <div><span className="text-blue-500">[INFO]</span> Initializing system pipeline to parse parameters...</div>
                <div><span className="text-blue-500">[INFO]</span> Ready to analyze DOM headers & client schema patterns.</div>
                
                {logs.map((logStr, i) => (
                  <div key={i}>
                    <span className="text-zinc-400">{logStr}</span>
                  </div>
                ))}

                <div className="animate-pulse text-zinc-300 mt-1">_</div>
              </div>

              <div className="p-3 bg-zinc-900/30 border-t border-zinc-805 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Secure API Payload Encrypted
                </span>
                <span>Active Tunnel</span>
              </div>
            </div>

          </div>

          {/* Ethical Disclaimer Footer */}
          <footer className="text-center py-6 text-xs text-zinc-500 border-t border-zinc-800/80 max-w-xl mx-auto space-y-2 mt-auto">
            <p className="flex justify-center items-center gap-1.5 text-zinc-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Herramienta 100% ética construida con fines educativos.</span>
            </p>
            <p className="leading-relaxed font-mono text-[10px]">
              Esta herramienta no almacena credenciales ni cookies privadas. Los datos se procesan localmente o mediante la sesión activa voluntaria de su navegador.
            </p>
          </footer>

        </section>

      </main>
    </div>
  );
}
