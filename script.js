const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCQ0NSLVNEREUiLCJzdWIiOiJKLXJvbGRAaG90bWFpbC5jb20iLCJhdWQiOiJTRERFLVNpdGlvRXh0ZXJubyIsImV4cCI6MjUzNDAyMzAwODAwLCJuYmYiOjE3NjUxNzE0NjksImlhdCI6MTc2NTE3MTQ2OSwianRpIjoiNTlkMGIyNjUtN2QxYi00NDVkLWEyNTQtYjE0YTFhZWUxNjU3IiwiZW1haWwiOiJKLXJvbGRAaG90bWFpbC5jb20ifQ.WD-2f97SIu-N8GhnAz5tBio8jVuH3NyrJp_70L58eas';

async function obtenerTipoCambio(id, fechaISO) {
    const fechaBccr = fechaISO.replace(/-/g, "/");
    // URL de respaldo sugerida en la pág 21 del manual
    const urlOriginal = `https://azapp-sdde-prod-002.azurewebsites.net/api/Bccr.GE.SDDE.Publico.Indicadores.API/indicadoresEconomicos/${id}/series?fechaInicio=${fechaBccr}&fechaFin=${fechaBccr}&idioma=es`;
    
    // El proxy es VITAL para que funcione en GitHub
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlOriginal)}`;

    try {
        const respuesta = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!respuesta.ok) return null;

        const data = await respuesta.json();
        // Estructura según Anexo B del manual
        if (data && data.datos && data.datos.length > 0) {
            return parseFloat(data.datos[0].valor).toFixed(2);
        }
        return null;
    } catch (error) {
        console.error("Error en indicador " + id, error);
        return null;
    }
}

async function actualizarDatos() {
    const status = document.getElementById('status');
    const fechaInput = document.getElementById('fechaBusqueda').value;
    
    status.innerText = "Conectando con el BCCR...";

    const compra = await obtenerTipoCambio(317, fechaInput);
    const venta = await obtenerTipoCambio(318, fechaInput);

    if (compra && venta) {
        document.getElementById('compra').innerText = compra;
        document.getElementById('venta').innerText = venta;
        status.style.color = "green";
        status.innerText = "Datos actualizados correctamente.";
    } else {
        status.style.color = "red";
        status.innerHTML = "No hay datos para esta fecha.<br><small>Pruebe con un día hábil anterior.</small>";
    }
}

window.onload = () => {
    // Hoy es 5 de enero, pero para asegurar datos cargamos el cierre del 2 de enero (Viernes)
    // ya que el API tarda en actualizar los fines de semana.
    const fechaDefecto = "2026-01-02"; 
    document.getElementById('fechaBusqueda').value = fechaDefecto;
    actualizarDatos();
};
