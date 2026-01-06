const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCQ0NSLVNEREUiLCJzdWIiOiJKLXJvbGRAaG90bWFpbC5jb20iLCJhdWQiOiJTRERFLVNpdGlvRXh0ZXJubyIsImV4cCI6MjUzNDAyMzAwODAwLCJuYmYiOjE3NjUxNzE0NjksImlhdCI6MTc2NTE3MTQ2OSwianRpIjoiNTlkMGIyNjUtN2QxYi00NDVkLWEyNTQtYjE0YTFhZWUxNjU3IiwiZW1haWwiOiJKLXJvbGRAaG90bWFpbC5jb20ifQ.WD-2f97SIu-N8GhnAz5tBio8jVuH3NyrJp_70L58eas';

// 1. Esta función se asegura de que la fecha se envíe como YYYY/MM/DD
async function obtenerIndicador(id, fechaISO) {
    const fechaBccr = fechaISO.replace(/-/g, "/");
    
    // Usamos la URL de Azure (pág 21 del manual) y el Proxy para evitar el error de CORS
    const urlBccr = `https://azapp-sdde-prod-002.azurewebsites.net/api/Bccr.GE.SDDE.Publico.Indicadores.API/indicadoresEconomicos/${id}/series?fechaInicio=${fechaBccr}&fechaFin=${fechaBccr}&idioma=es`;
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
        
        // Estructura según el Anexo B del manual SDDE
        if (data && data.datos && data.datos.length > 0) {
            return parseFloat(data.datos[0].valor).toFixed(2);
        }
        return null;
    } catch (error) {
        console.error("Error en " + id, error);
        return null;
    }
}

// 2. Esta función lee la fecha del calendario y actualiza la pantalla
async function actualizarDatos() {
    const status = document.getElementById('status');
    const fechaInput = document.getElementById('fechaBusqueda'); // Asegúrate que tu HTML tenga id="fechaBusqueda"
    
    if (!fechaInput.value) {
        status.innerText = "Por favor selecciona una fecha";
        return;
    }

    status.innerText = "Consultando BCCR...";

    const compra = await obtenerIndicador(317, fechaInput.value);
    const venta = await obtenerIndicador(318, fechaInput.value);

    if (compra && venta) {
        document.getElementById('compra').innerText = compra;
        document.getElementById('venta').innerText = venta;
        status.style.color = "green";
        status.innerText = "Sincronizado con éxito";
    } else {
        status.style.color = "red";
        status.innerHTML = "Sin datos para esta fecha.<br><small>Prueba con un día hábil anterior.</small>";
        document.getElementById('compra').innerText = "---";
        document.getElementById('venta').innerText = "---";
    }
}

// 3. Configuración inicial al abrir la página
window.onload = () => {
    const fechaInput = document.getElementById('fechaBusqueda');
    
    // Ponemos por defecto el viernes pasado (2 de enero) para asegurar que haya datos
    // ya que hoy es lunes y el BCCR puede tardar en procesar.
    const fechaDefecto = "2026-01-02"; 
    fechaInput.value = fechaDefecto;
    
    actualizarDatos();
};
