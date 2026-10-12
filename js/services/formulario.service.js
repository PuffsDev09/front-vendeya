// ============================================================
//  Servicio del Formulario — Toggle de secciones Lima/Provincia
// ============================================================
import { centrarEnDistrito, invalidarTamano } from './mapa.service.js';

/**
 * Inicializa los listeners del formulario.
 * - Muestra/oculta las secciones según tipo de envío
 * - Centra el mapa al seleccionar un distrito
 */
export function inicializarFormulario() {
    const tipoEnvio = document.getElementById('tipo_envio');
    const distritoSelect = document.getElementById('distrito_lima');

    const seccionLima = document.getElementById('seccionLima');
    const seccionProvincia = document.getElementById('seccionProvincia');
    // const inputDireccion = document.getElementById('direccion_link'); // REMOVIDO: ya no existe en el HTML
    const inputAgencia = document.getElementById('agencia_provincia');

    tipoEnvio.addEventListener('change', () => {
        const tipo = tipoEnvio.value;

        // Ocultar ambas secciones y reiniciar obligatoriedad
        seccionLima.classList.add('hidden');
        seccionProvincia.classList.add('hidden');
        
        // inputDireccion.required = false; // REMOVIDO
        distritoSelect.required = false;
        inputAgencia.required = false;

        // Mostrar la sección correspondiente y volver campos obligatorios
        if (tipo === 'Lima') {
            seccionLima.classList.remove('hidden');
            // inputDireccion.required = true; // REMOVIDO
            distritoSelect.required = true;
            invalidarTamano();

        } else if (tipo === 'Provincia') {
            seccionProvincia.classList.remove('hidden');
            inputAgencia.required = true;
        }
    });

    distritoSelect.addEventListener('change', () => {
        centrarEnDistrito(distritoSelect.value);
    });

    configurarValidacionWhatsApp();
}

/**
 * Configura la validación estricta del campo WhatsApp:
 * - Solo acepta 9 números.
 * - Bloquea letras, símbolos (+51), espacios o guiones.
 * - En caso de pegar (Ctrl+V) con exceso de caracteres o prefijos,
 *   extrae los 9 dígitos y muestra el mini aviso explicativo.
 */
function configurarValidacionWhatsApp() {
    const input = document.getElementById('whatsapp');
    const aviso = document.getElementById('whatsapp_aviso');
    if (!input) return;

    let avisoTimeout = null;

    function mostrarAviso(mensajePersonalizado = null) {
        if (!aviso) return;
        if (mensajePersonalizado) {
            const spanTexto = aviso.querySelector('span:last-child');
            if (spanTexto) spanTexto.innerHTML = mensajePersonalizado;
        }
        aviso.classList.remove('hidden');
        if (avisoTimeout) clearTimeout(avisoTimeout);
        avisoTimeout = setTimeout(() => {
            aviso.classList.add('hidden');
        }, 5000);
    }

    function ocultarAviso() {
        if (!aviso) return;
        if (avisoTimeout) clearTimeout(avisoTimeout);
        aviso.classList.add('hidden');
    }

    // Interceptar pegado (Ctrl + V / Pegar desde menú contextual / móvil)
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const textoPegado = (e.clipboardData || window.clipboardData)?.getData('text') || '';

        // Extraer únicamente los dígitos
        let digitos = textoPegado.replace(/\D/g, '');
        let huboExceso = false;

        // Si el texto original contenía caracteres no numéricos (+, espacios, letras, etc.)
        if (textoPegado.trim() !== digitos) {
            huboExceso = true;
        }

        // Si el número incluye prefijo '51' de Perú con más de 9 dígitos (ej. 51987654321)
        if (digitos.startsWith('51') && digitos.length > 9) {
            digitos = digitos.substring(2);
            huboExceso = true;
        }

        // Si excede los 9 dígitos reglamentarios
        if (digitos.length > 9) {
            digitos = digitos.slice(0, 9);
            huboExceso = true;
        }

        input.value = digitos;

        if (huboExceso) {
            mostrarAviso('Solo debes poner los <strong>9 números</strong> del teléfono, sin prefijo (+51) ni espacios.');
        } else {
            ocultarAviso();
        }

        input.dispatchEvent(new Event('input'));
    });

    // Control en tiempo real mientras el usuario escribe o modifica el campo
    input.addEventListener('input', () => {
        const valorOriginal = input.value;
        let valorLimpio = valorOriginal.replace(/\D/g, '');
        let huboExceso = false;

        // Si escribió algún carácter no numérico (+, -, espacio, letra)
        if (valorOriginal !== valorLimpio) {
            huboExceso = true;
        }

        // Si escribió o se coló el prefijo 51
        if (valorLimpio.startsWith('51') && valorLimpio.length > 9) {
            valorLimpio = valorLimpio.substring(2);
            huboExceso = true;
        }

        // Si sobrepasa los 9 dígitos
        if (valorLimpio.length > 9) {
            valorLimpio = valorLimpio.slice(0, 9);
            huboExceso = true;
        }

        input.value = valorLimpio;

        if (huboExceso) {
            mostrarAviso('Solo debes poner los <strong>9 números</strong> del teléfono, sin prefijo (+51) ni espacios.');
        }
    });

    // Al salir del campo, si faltan dígitos
    input.addEventListener('blur', () => {
        if (input.value.length > 0 && input.value.length < 9) {
            mostrarAviso('El número debe tener exactamente <strong>9 dígitos</strong>.');
        }
    });
}
