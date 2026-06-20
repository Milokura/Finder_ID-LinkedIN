import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, Bookmark, Copy, Check, ChevronRight, Info } from "lucide-react";

export function BookmarkletGuide() {
  const [copied, setCopied] = useState(false);
  const bookmarkRef = useRef<HTMLAnchorElement>(null);

  const bookmarkletCode = `javascript:(function(){try{const url=window.location.href;const path=window.location.pathname;let username=null;const inM=path.match(/\\/in\\/([^/?#]+)/);if(inM)username=inM[1];else{const salesM=url.match(/\\/sales\\/(?:profile|people)\\/([^/?#&]+)/);if(salesM)username=salesM[1];else{const recM=url.match(/\\/(?:recruiter|talent)\\/profile\\/([^/?#&]+)/);if(recM)username=recM[1];}}if(!username){alert("Por favor, navega al perfil de LinkedIn de alguna persona para extraer su ID.");return;}function decodeEntities(html){const txt=document.createElement("textarea");txt.innerHTML=html;return txt.value;}const candidateIds={};function addId(id,score,type){if(!id||!/^\\d{5,15}$/.test(id))return;if(!candidateIds[id]){candidateIds[id]={id,score:0,types:[]};}if(score>candidateIds[id].score){candidateIds[id].score=score;}candidateIds[id].types.push(type);}function scanObject(obj,parentIsTarget){if(!obj)return;if(Array.isArray(obj)){obj.forEach(item=>scanObject(item,parentIsTarget));}else if(typeof obj==="object"){let isTarget=parentIsTarget;const pubId=obj.publicIdentifier||obj.publicId;if(pubId&&typeof pubId==="string"&&username&&pubId.toLowerCase().trim()===username.toLowerCase().trim()){isTarget=true;}for(const k in obj){if(Object.prototype.hasOwnProperty.call(obj,k)){const val=obj[k];const valStr=String(val);if(typeof val==="string"){const urnM=val.match(/urn:li:(member|person|fs_miniProfile|fsd_profile|fs_profile):(\\d{5,15})/i);if(urnM){addId(urnM[2],isTarget?1000:50,"urn_"+urnM[1]);}}if(k==="memberId"||k==="ownerMemberId"||k==="authorId"||k==="profileId"){if(/^\\d{5,15}$/.test(valStr)){addId(valStr,isTarget?900:40,"key_"+k);}}if(val&&typeof val==="object"){scanObject(val,isTarget);}}}}}function scanCodeTags(container){container.querySelectorAll("code").forEach(c=>{const text=c.textContent||c.innerHTML||"";if(!text)return;const decoded=decodeEntities(text);let parsed=null;try{parsed=JSON.parse(decoded);}catch(e){try{parsed=JSON.parse(text);}catch(err){}}if(parsed){scanObject(parsed,false);}else{scanTextFallback(decoded);scanTextFallback(text);}});}/\\b(?:member|person|fs_miniProfile|fsd_profile|fs_profile)(?:[^a-zA-Z0-9]{1,10})(\\d{5,15})\\b/gi;function scanTextFallback(text){const regexes=[/urn:li:(?:member|person|fs_miniProfile|fsd_profile|fs_profile):(\\d{5,15})/gi,/"memberId"\\s*:\\s*"*(\\d{5,15})"*/gi,/memberId(?:[^a-zA-Z0-9]{1,10})(\\d{5,15})/gi];regexes.forEach(rx=>{let m;rx.lastIndex=0;while((m=rx.exec(text))!==null){const isPriority=username&&text.toLowerCase().includes(username.toLowerCase());addId(m[1],isPriority?100:10,"regex_fallback");}});};scanCodeTags(document);scanTextFallback(document.documentElement.outerHTML);fetch(window.location.href).then(r=>r.text()).then(html=>{try{const parser=new DOMParser();const doc=parser.parseFromString(html,"text/html");scanCodeTags(doc);scanTextFallback(html);showResults();}catch(e){showResults();}}).catch(()=>{showResults();});function showResults(){const candidates=Object.values(candidateIds);if(candidates.length>0){candidates.sort((a,b)=>b.score-a.score);const topId=candidates[0].id;let msg="¡ID de LinkedIn Detectado con Éxito!\\n\\n";msg+="ID numérico de la persona: "+topId+"\\n\\n";msg+="Este ID ha sido copiado automáticamente a tu portapapeles.";navigator.clipboard.writeText(topId).then(()=>{alert(msg);}).catch(()=>{alert("ID de la persona: "+topId+"\\n\\nPor favor, cópialo manualmente de aquí.");});}else{alert("No se pudo detectar el ID numérico del perfil todavía.\\n\\nSugerencias:\\n1. Asegúrate de estar en la pestaña de un Perfil de LinkedIn.\\n2. Si hay un aviso de privacidad bloqueando la pantalla, haz clic en 'Aceptar' para cerrarlo.\\n3. O haz clic en el botón 'Información de contacto' del perfil de LinkedIn para forzar la carga de datos en memoria.");}}}catch(err){alert("Error en el extractor: "+err.message);}})();`;

  useEffect(() => {
    if (bookmarkRef.current) {
      bookmarkRef.current.setAttribute("href", bookmarkletCode);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-805 rounded-xl p-5 md:p-6 shadow-xl" id="bookmarklet-guide">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600/10 text-blue-400 p-2 rounded-lg">
          <Bookmark className="w-5 h-5 animate-pulse" />
        </div>
        <h3 className="text-lg font-display font-semibold text-zinc-100">
          Marcador Mágico (Bookmarklet)
        </h3>
      </div>

      <p className="text-zinc-300 text-sm mb-5 leading-relaxed">
        Un <strong>Bookmarklet de Navegador</strong> es un pequeño código que ejecutas al pulsar un marcador. Te permite extraer el ID de un perfil directamente mientras estás en LinkedIn, saltándote bloqueos de servidor de forma 100% ética y segura de navegador local.
      </p>

      {/* Interactive Bookmark Button */}
      <div className="bg-zinc-950/60 rounded-xl p-5 border border-zinc-850 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <span className="text-[10px] font-mono text-blue-400 font-semibold tracking-wider uppercase block mb-1">
            BOTÓN COMPILADO
          </span>
          <p className="text-zinc-400 text-xs">
            Arrastra este botón azul a la barra de marcadores de tu navegador:
          </p>
        </div>

        <a
          ref={bookmarkRef}
          onClick={(e) => {
            e.preventDefault();
            alert("¡Para usar este botón, debes arrastrarlo a tu barra de marcadores de Chrome/Firefox/Safari, no hacer clic directo aquí!");
          }}
          className="cursor-grab active:cursor-grabbing inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold font-display text-sm rounded-lg shadow-lg hover:shadow-blue-900/40 transition-all duration-300 border border-blue-500/30 group font-mono"
          title="Arrastra esto a tu barra de marcadores"
        >
          <Bookmark className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span>Obtener ID de LinkedIn</span>
        </a>
      </div>

      {/* Manual copy box as alternate */}
      <div className="mb-6">
        <span className="text-xs font-mono text-zinc-400 block mb-2">
          ¿No puedes arrastrarlo? Agrega un marcador manual con el siguiente código:
        </span>
        <div className="flex gap-2 items-stretch">
          <div className="bg-zinc-950 text-zinc-400 px-3 py-2 text-xs font-mono rounded-lg border border-zinc-800 flex-1 overflow-x-auto whitespace-nowrap scrollbar-thin select-all align-middle flex items-center">
            {bookmarkletCode.substring(0, 52)}...
          </div>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Installation walkthrough */}
      <div className="space-y-3.5 py-2 border-t border-zinc-800/80">
        <h4 className="text-zinc-200 font-display text-sm font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-zinc-400" />
          ¿Cómo instalar y usar en 3 pasos rápidos?
        </h4>
        <ol className="space-y-2 text-xs text-zinc-300 pl-1 list-none">
          <li className="flex gap-2 items-start">
            <span className="flex-none bg-zinc-800 w-5 h-5 rounded-full flex items-center justify-center font-mono font-semibold text-[10px] text-zinc-300 mt-0.5">
              1
            </span>
            <span>
              Asegúrate de tener activa la <strong>Barra de marcadores</strong> de tu navegador (en Chrome pulsa <kbd className="bg-zinc-850 px-1 py-0.5 rounded text-zinc-200 border border-zinc-700 text-[10px]">Ctrl + Mayús + B</kbd> o <kbd className="bg-zinc-850 px-1 py-0.5 rounded text-zinc-200 border border-zinc-700 text-[10px]">Cmd + Shift + B</kbd>).
            </span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="flex-none bg-zinc-800 w-5 h-5 rounded-full flex items-center justify-center font-mono font-semibold text-[10px] text-zinc-300 mt-0.5">
              2
            </span>
            <span>
              Arrastra el botón azul <strong>"Obtener ID de LinkedIn"</strong> de arriba a esa barra de marcadores.
            </span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="flex-none bg-zinc-800 w-5 h-5 rounded-full flex items-center justify-center font-mono font-semibold text-[10px] text-zinc-300 mt-0.5">
              3
            </span>
            <span>
              Abre el perfil de LinkedIn de cualquier persona y pulsa una vez sobre ese marcador. El ID de perfil se mostrará en pantalla y se copiará automáticamente al portapapeles.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
