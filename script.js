// Tu token según el manual se envía como "Bearer Token"
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCQ0NSLVNEREUiLCJzdWIiOiJKLXJvbGRAaG90bWFpbC5jb20iLCJhdWQiOiJTRERFLVNpdGlvRXh0ZXJubyIsImV4cCI6MjUzNDAyMzAwODAwLCJuYmYiOjE3NjUxNzE0NjksImlhdCI6MTc2NTE3MTQ2OSwianRpIjoiNTlkMGIyNjUtN2QxYi00NDVkLWEyNTQtYjE0YTFhZWUxNjU3IiwiZW1haWwiOiJKLXJvbGRAaG90bWFpbC5jb20ifQ.WD-2f97SIu-N8GhnAz5tBio8jVuH3NyrJp_70L58eas';

async function obtenerIndicadorSDDE(id) {
    // El manual pide formato yyyy/mm/dd (Página 14)
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}/${String(ahora.getMonth() + 1).padStart(2, '0')}/${String(ahora.getDate()).padStart(2, '0')}`;
    
    // URL según Anexo A del manual (Página 19)
    const urlBccr = `https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.Publico.Indicadores.API/indicadoresEconomicos/${id}/series?fechaInicio=${hoy}&fechaFin=${hoy}&idioma=es`;

    // Para evitar CORS y poder enviar el Header "Authorization", usamos corsproxy.io
    // que permite reenviar encabezados.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlBccr)}`;

    try {
        const respuesta = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                // Según manual Anexo D (Página 22)
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            console.error("Error BCCR:", errorData.Mensaje); // Manejo de errores Anexo C
            return null;
        }

        const data = await respuesta.json();
        
        // Estructura de respuesta según manual (Página 15): data.datos[0].valor
        if (data && data.datos && data.datos.length > 0) {
            return parseFloat(data.datos[0].valor).toFixed(2);
        }
        return null;

    } catch (error) {
        console.error("Fallo de conexión:", error);
        return null;
    }
}

async function actualizarDatos() {
    const status = document.getElementById('status');
    status.innerText = "Consultando SDDE (Estándar 2025)...";

    // 317 = Compra, 318 = Venta
    const compra = await obtenerIndicadorSDDE(317);
    const venta = await obtenerIndicadorSDDE(318);

    if (compra && venta) {
        document.getElementById('compra').innerText = compra;
        document.getElementById('venta').innerText = venta;
        document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();
        status.innerText = "Sincronización exitosa con SDDE";
    } else {
        status.innerText = "Error: Verifica el Token o los permisos del API";
    }
}

window.onload = actualizarDatos;