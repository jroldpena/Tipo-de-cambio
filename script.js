const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCQ0NSLVNEREUiLCJzdWIiOiJKLXJvbGRAaG90bWFpbC5jb20iLCJhdWQiOiJTRERFLVNpdGlvRXh0ZXJubyIsImV4cCI6MjUzNDAyMzAwODAwLCJuYmYiOjE3NjUxNzE0NjksImlhdCI6MTc2NTE3MTQ2OSwianRpIjoiNTlkMGIyNjUtN2QxYi00NDVkLWEyNTQtYjE0YTFhZWUxNjU3IiwiZW1haWwiOiJKLXJvbGRAaG90bWFpbC5jb20ifQ.WD-2f97SIu-N8GhnAz5tBio8jVuH3NyrJp_70L58eas';

async function obtenerIndicador(id, fechaISO) {
    // Formato manual pág 14: yyyy/mm/dd
    const fechaBccr = fechaISO.replace(/-/g, "/");
    
    // URL de Azure (Página 21 del manual) - Evita el error ERR_NAME_NOT_RESOLVED
    const urlBccr = `https://azapp-sdde-prod-002.azurewebsites.net/api/Bccr.GE.SDDE.Publico.Indicadores.API/indicadoresEconomicos/${id}/series?fechaInicio=${fechaBccr}&fechaFin=${fechaBccr}&idioma=es`;

    // Proxy para saltar el bloqueo de CORS en GitHub
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlBccr)}`;

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
        
        // Estructura según Anexo B (Pág 20 del manual)
        if (data && data.datos && data.datos.length > 0) {
            return parseFloat(data.datos[0].valor).toFixed(2);
        }
        return null;

    } catch (error) {
        console.error("Error en " + id + ":", error);
        return null;
    }
}

async function actualizarDatos() {
    const status = document.getElementById('status');
    const fechaInput = document.getElementById('fechaBusqueda').value;

    status.innerText = "Sincronizando con BCCR...";

    const compra = await obtenerIndicador(317, fechaInput);
    const venta = await obtenerIndicador(318, fechaInput);

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

// Configuración al cargar
window.onload = () => {
    // Hoy es Lunes 5 de Enero. Como el BCCR puede tardar en actualizar, 
    // ponemos el cierre del viernes 2 de Enero por defecto.
    const fechaDefecto = "2026-01-02";
    document.getElementById('fechaBusqueda').value = fechaDefecto;
    actualizarDatos();
};
