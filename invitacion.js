// URL de tu servidor backend local
const API_URL = 'https://backend-boda-dghi.onrender.com/api';

console.log("1. El archivo invitacion.js cargó correctamente");

// Extraer el "token" de la URL
const parametrosURL = new URLSearchParams(window.location.search);
const token = parametrosURL.get('token');

console.log("2. El token leído de la URL es:", token);

// Referencias a los elementos del HTML
const tituloNombre = document.getElementById('guest-name');
const btnAsistire = document.getElementById('btn-yes');
const btnNoAsistire = document.getElementById('btn-no');
const mensajeEstado = document.getElementById('mensaje-estado');

// Función para cargar los datos del invitado
async function cargarInvitacion() {
    if (!token) {
        console.log("3. No hay token en la URL, deteniendo proceso.");
        if (tituloNombre) tituloNombre.textContent = "Enlace no válido";
        return;
    }

    try {
        console.log("3. Consultando a la base de datos...");
        const respuesta = await fetch(`${API_URL}/invitacion/${token}`);
        const invitado = await respuesta.json();

        console.log("4. Datos recibidos del servidor:", invitado);

        if (respuesta.ok) {
            tituloNombre.textContent = invitado.nombres;

            // Validamos si ya pasó el tiempo límite de modificación[cite: 1]
            const ahora = new Date();
            const fechaLimite = new Date(invitado.limiteModificacion);

            console.log("Fecha actual:", ahora);
            console.log("Fecha límite:", fechaLimite);

            if (ahora > fechaLimite) {
                if (mensajeEstado) mensajeEstado.textContent = "El tiempo para confirmar asistencia ha finalizado.";
            } else {
                // Habilitamos los botones si aún hay tiempo
                if (btnAsistire) btnAsistire.disabled = false;
                if (btnNoAsistire) btnNoAsistire.disabled = false;

                if (invitado.estadoAsistencia !== 'Pendiente') {
                    if (mensajeEstado) mensajeEstado.textContent = `Tu respuesta actual: ${invitado.estadoAsistencia}`;
                }
            }
        } else {
            if (tituloNombre) tituloNombre.textContent = "Invitación no encontrada";
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// Función para enviar la respuesta de asistencia
async function enviarRespuesta(estado) {
    try {
        const respuesta = await fetch(`${API_URL}/invitacion/${token}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estadoAsistencia: estado })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            if (mensajeEstado) mensajeEstado.textContent = `¡Gracias! Has confirmado que: ${estado}`;
            alert("Tu respuesta ha sido guardada.");
        } else {
            alert(datos.error); 
        }
    } catch (error) {
        alert("Hubo un error al enviar tu respuesta.");
    }
}

// Asignar los eventos de clic a los botones (solo si existen en el HTML)
if (btnAsistire) btnAsistire.addEventListener('click', () => enviarRespuesta('Asistirá'));
if (btnNoAsistire) btnNoAsistire.addEventListener('click', () => enviarRespuesta('No asistirá'));

// 👇 ESTA ES LA LÍNEA MÁS IMPORTANTE QUE HACE QUE TODO ARRANQUE 👇
cargarInvitacion();

// --- LÓGICA DEL CONTADOR DE TIEMPO ---
const fechaBoda = new Date(2026, 12, 18, 15, 0, 0).getTime();
const elementoDias = document.getElementById('dias');
const elementoHoras = document.getElementById('horas');
const elementoMinutos = document.getElementById('minutos');
const elementoSegundos = document.getElementById('segundos');

if (elementoDias && elementoHoras && elementoMinutos && elementoSegundos) {
    const intervaloReloj = setInterval(() => {
        const ahora = new Date().getTime();
        const distancia = fechaBoda - ahora;

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        elementoDias.textContent = dias < 10 ? "0" + dias : dias;
        elementoHoras.textContent = horas < 10 ? "0" + horas : horas;
        elementoMinutos.textContent = minutos < 10 ? "0" + minutos : minutos;
        elementoSegundos.textContent = segundos < 10 ? "0" + segundos : segundos;

        if (distancia < 0) {
            clearInterval(intervaloReloj);
            elementoDias.textContent = "00";
            elementoHoras.textContent = "00";
            elementoMinutos.textContent = "00";
            elementoSegundos.textContent = "00";
        }
    }, 1000);
}

// Cambia esto:
// const API_URL = 'http://localhost:3000/api';

// Por tu nueva URL de Render:
