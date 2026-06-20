import React from "react";
import { Eye, Terminal, ChevronRight, HelpCircle, Code } from "lucide-react";

export function ChromeGuide() {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-805 rounded-xl p-5 md:p-6 shadow-xl" id="chrome-guide">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600/10 text-blue-400 p-2 rounded-lg">
          <Eye className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-display font-semibold text-zinc-100">
          Guía de Inspección Manual en Navegador (DevTools)
        </h3>
      </div>

      <p className="text-zinc-300 text-sm mb-5 leading-relaxed">
        Si eres desarrollador, puedes inspeccionar el ID de cualquier miembro directamente en tu navegador usando las herramientas de desarrollador (<kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200 text-xs border border-zinc-700">F12</kbd> o <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200 text-xs border border-zinc-700">Ctrl + Shift + I</kbd>). Aquí tienes los 2 trucos más rápidos:
      </p>

      <div className="space-y-4">
        {/* Method A */}
        <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
              TRUCO 1
            </span>
            <span className="text-xs font-display font-bold text-zinc-200">
              Botón de Reportar Perfil o Solicitud de Mensaje
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
            Los endpoints de contacto y reporte de LinkedIn forzosamente exponen la URN y el ID persistente del usuario.
          </p>
          <ul className="space-y-1.5 text-xs text-zinc-300 pl-1 list-none font-mono">
            <li className="flex gap-1.5 items-start">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Haz clic derecho en cualquier parte vacía y selecciona <strong>Inspeccionar</strong>.</span>
            </li>
            <li className="flex gap-1.5 items-start">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Pulsa <kbd className="bg-zinc-800 px-1 py-0.5 border border-zinc-750 rounded">Ctrl + F</kbd> para buscar dentro de Elements.</span>
            </li>
            <li className="flex gap-1.5 items-start">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Escribe <code className="text-emerald-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">report-profile-</code> o <code className="text-emerald-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">urn:li:member:</code>. El número de 8-10 cifras que sigue es el Member ID.</span>
            </li>
          </ul>
        </div>

        {/* Method B */}
        <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
              TRUCO 2
            </span>
            <span className="text-xs font-display font-bold text-zinc-200">
              Uso de la Red (Network requests)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
            LinkedIn descarga metadatos de minitargetas mediante peticiones llamadas <code className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">identityDashProfiles</code> o <code className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">miniProfile</code>.
          </p>
          <ul className="space-y-1.5 text-xs text-zinc-300 pl-1 list-none font-mono">
            <li className="flex gap-1.5 items-start">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Ve a la pestaña <strong>Network</strong> (Red) de tus herramientas de desarrollador.</span>
            </li>
            <li className="flex gap-1.5 items-start">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Filtra las búsquedas por el término <code className="text-blue-450 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">miniProfile</code> o <code className="text-blue-450 bg-zinc-90 w-full px-1.5 py-0.5 rounded border border-zinc-800">profile</code>.</span>
            </li>
            <li className="flex gap-1.5 items-start">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Selecciona una de las peticiones que retornen datos JSON y busca el campo <code className="text-emerald-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">publicIdentifier</code> o <code className="text-emerald-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">objectUrn</code> para ver las dos versiones del ID.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
