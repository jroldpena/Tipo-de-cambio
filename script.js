// 🔑 Tu Token de Seguridad (Página 10 del manual)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCQ0NSLVNEREUiLCJzdWIiOiJKLXJvbGRAaG90bWFpbC5jb20iLCJhdWQiOiJTRERFLVNpdGlvRXh0ZXJubyIsImV4cCI6MjUzNDAyMzAwODAwLCJuYmYiOjE3NjUxNzE0NjksImlhdCI6MTc2NTE3MTQ2OSwianRpIjoiNTlkMGIyNjUtN2QxYi00NDVkLWEyNTQtYjE0YTFhZWUxNjU3IiwiZW1haWwiOiJKLXJvbGRAaG90bWFpbC5jb20ifQ.WD-2f97SIu-N8GhnAz5tBio8jVuH3NyrJp_70L58eas';

/**
 * Función para consultar un indicador específico (Compra=317, Venta=318)
 * Utiliza la URL de respaldo en Azure recomendada en la Página 21 del manual.
 */
async function consultarBCCR(idIndicador, fechaISO) {
    // El manual exige formato YYYY/MM/DD (Página 14)
    const fechaFormateada = fechaISO.replace(/-/g, "/");
    
    // Endpoint oficial según Anexo A
    const urlBase = `https://azapp-sdde-prod-002.azurewebsites.net/api/Bccr.GE.SDDE.Publico.Indicadores.API/indicadoresEconomicos/${idIndicador}/series?fechaInicio=${fechaFormateada}&fechaFin=${fechaFormateada}&idioma=es`;

    // Proxy para evitar errores de CORS y permitir el Header de Autorización
    const urlConProxy = `https://corsproxy.io/?${encodeURIComponent(urlBase)}`;

    try {
        const respuesta = await fetch(urlConProxy, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            console.error(`Error ${respuesta.status}: ${error.Mensaje || 'Fallo de conexión'}`);
            return null;
        }

        const data = await respuesta.json();

        // Estructura de respuesta del Anexo B (Página 20)
        if (data && data.datos && data.datos.length > 0) {
            return parseFloat(data.datos[0].valor).toFixed(2);
        } else {
            return null; // No hay datos (feriado o fin de semana)
        }

    } catch (e) {
        console.error("Error técnico de red:", e);
        return null;
    }
}

/**
 * Función que activa la consulta desde el botón de la web
 */
async function actualizarVista() {
    const status = document.getElementById('status');
    const fechaSeleccionada = document.getElementById('fechaBusqueda').value;

    if (!fechaSeleccionada) {
        status.innerText = "Seleccione una fecha válida.";
        return;
    }

    status.innerText = "Conectando con el servidor BCCR...";

    // Consultas simultáneas para Compra (317) y Venta (318)
    const valorCompra = await consultarBCCR(317, fechaSeleccionada);
    const valorVenta = await consultarBCCR(318, fechaSeleccionada);

    if (valorCompra && valorVenta) {
        document.getElementById('compra').innerText = valorCompra;
        document.getElementById('venta').innerText = valorVenta;
        status.style.color = "green";
        status.innerText = "Sincronización exitosa.";
    } else {
        status.style.color = "red";
        status.innerHTML = "<b>Sin datos:</b> El BCCR no tiene registros para esta fecha.<br><small>Pruebe con el último día hábil anterior.</small>";
    }
}

// Carga inicial: Por defecto muestra el cierre del último día hábil
window.onload = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 1); // Ayer
    document.getElementById('fechaBusqueda').value = fecha.toISOString().split('T')[0];
    actualizarVista();
};
