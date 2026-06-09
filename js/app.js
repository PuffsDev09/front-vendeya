// ============================================================
//  Punto de Entrada — Registro de Pedido (index.html)
// ============================================================

// --- Servicios ---
import { iniciarMapa } from './services/mapa.service.js';
import {
    inicializarAgencias,
    abrirModalAgencias,
    cerrarModalBackdropAgencias,
    buscarYSeleccionarAgencia
} from './services/agencias.service.js';
import { inicializarFormulario } from './services/formulario.service.js';
import { inicializarEnvio } from './services/envio.service.js';

// ---- Funciones globales (necesarias para onclick en HTML) ----
window.abrirModalAgencias = abrirModalAgencias;
window.cerrarModalBackdropAgencias = cerrarModalBackdropAgencias;

// ---- Lógica de prellenado por URL ----
function prellenarDesdeURL() {
    const parametros = new URLSearchParams(window.location.search);

    const camposFormulario = {
        'nombre': 'nombre_completo', 
        'dni': 'dni',               
        'whatsapp': 'whatsapp',     
        'producto': 'producto',     
    };

    // Prellenar campos de texto simples
    for (const [parametroURL, idElementoHTML] of Object.entries(camposFormulario)) {
        if (parametros.has(parametroURL)) {
            const elemento = document.getElementById(idElementoHTML);
            if (elemento) {
                elemento.value = parametros.get(parametroURL);
            }
        }
    }

    // Lógica para 'envio' (Lima vs Provincia)
    if (parametros.has('envio')) {
        const envioVal = parametros.get('envio').toUpperCase();
        const tipoEnvio = document.getElementById('tipo_envio');
        
        if (envioVal.includes('LIMA')) {
            // Seleccionar Lima
            tipoEnvio.value = 'Lima';
            tipoEnvio.dispatchEvent(new Event('change'));
            
            // Extraer distrito asumiendo formato como "LIMA - SURQUILLO" o "LIMA ATE"
            const distritoLimpio = envioVal.replace('LIMA', '').replace('-', '').trim();
            const distritoSelect = document.getElementById('distrito_lima');
            
            // Buscar distrito en el select
            let optionEncontrada = null;
            for (let i = 0; i < distritoSelect.options.length; i++) {
                const optText = distritoSelect.options[i].text.toUpperCase();
                if (optText.includes(distritoLimpio) && distritoLimpio.length > 2) {
                    optionEncontrada = distritoSelect.options[i].value;
                    break;
                }
            }
            
            // Seleccionar y centrar mapa
            if (optionEncontrada) {
                distritoSelect.value = optionEncontrada;
                distritoSelect.dispatchEvent(new Event('change'));
            }
            
        } else if (envioVal.includes('PROVINCIA') || envioVal.includes('SHALOM')) {
            // Seleccionar Provincia
            tipoEnvio.value = 'Provincia';
            tipoEnvio.dispatchEvent(new Event('change'));
            
            // Extraer nombre de agencia asumiendo formato "PROVINCIA - SHALOM HUAYCAN"
            const agenciaLimpia = envioVal.replace('PROVINCIA', '').replace('SHALOM', '').replace('-', '').replace('-', '').trim();
            
            // Buscar y autoseleccionar
            const encontro = buscarYSeleccionarAgencia(agenciaLimpia);
            
            // Si no se encontró coincidencia exacta, mostrar mensaje amarillo
            if (!encontro) {
                const containerMsg = document.getElementById('mensaje_agencia_no_encontrada');
                if (containerMsg) {
                    containerMsg.innerHTML = `<div class="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg text-sm flex items-start gap-2 shadow-sm">
                        <span>📍</span>
                        <span>El cliente solicitó la agencia: <strong>${agenciaLimpia || envioVal}</strong>. Por favor, búscalo manualmente.</span>
                    </div>`;
                }
            }
        }
    }
}

// ---- Inicialización de servicios ----
iniciarMapa();
inicializarAgencias();
inicializarFormulario();
inicializarEnvio();

// Ejecutar prellenado después de inicializar la UI
prellenarDesdeURL();
