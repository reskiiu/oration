// URL de tu servidor backend en Render
const API_URL = 'https://backend-boda-dghi.onrender.com/api';

// Conexión para visualizar cada cambio a tiempo real usando Socket.io
const socket = io('https://backend-boda-dghi.onrender.com');

// Referencias a los elementos del HTML
const formInvitado = document.getElementById('form-invitado');
const inputNombre = document.getElementById('nombre-invitado');
const tablaInvitados = document.getElementById('tabla-invitados');

// Evento: Al enviar el formulario para crear un invitado
formInvitado.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue por defecto
    const nombre = inputNombre.value;

    try {
        // Hacemos la petición al servidor para guardar en MongoDB
        const respuesta = await fetch(`${API_URL}/invitados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombres: nombre })
        });

        if (respuesta.ok) {
            inputNombre.value = ''; // Limpiamos el campo de texto
            cargarInvitados(); // Recargamos la tabla para ver el nuevo enlace
        } else {
            console.error("Error del servidor al intentar guardar");
        }
    } catch (error) {
        console.error("Error al generar la invitación:", error);
    }
});

// Función para obtener todos los invitados de la base de datos y mostrarlos
async function cargarInvitados() {
    try {
        const respuesta = await fetch(`${API_URL}/invitados`);
        const invitados = await respuesta.json();
        
        // Limpiamos la tabla antes de llenarla
        tablaInvitados.innerHTML = '';

        invitados.forEach(invitado => {
            // 👇 SOLUCIÓN A PRUEBA DE BALAS PARA EL ENLACE 👇
            // Obtenemos la ruta base sin importar cómo se llame la carpeta en GitHub
            const rutaBase = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            
            // Construimos el enlace forzando que abra el archivo de la invitación para que solo puedan ver ese apartado[cite: 1]
            const enlaceUnico = `${rutaBase}/invitacion.html?token=${invitado.token}`;
            
            // Asignamos el color según el estado
            let claseEstado = 'pendiente';
            if(invitado.estadoAsistencia === 'Asistirá') claseEstado = 'asistira';
            if(invitado.estadoAsistencia === 'No asistirá') claseEstado = 'no-asistira';

            // Insertamos la fila en la tabla
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${invitado.nombres}</td>
                <td><a href="${enlaceUnico}" target="_blank">${enlaceUnico}</a></td>
                <td><span class="badge ${claseEstado}" id="estado-${invitado.token}">${invitado.estadoAsistencia}</span></td>
                <td>
                    <button onclick="navigator.clipboard.writeText('${enlaceUnico}')">Copiar</button>
                    <button onclick="eliminarInvitacion('${invitado.token}')" style="background-color: #dc3545; margin-left: 5px;">Eliminar</button>
                </td>
            `;
            tablaInvitados.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar la lista:", error);
    }
}

// ----------------------------------------------------
// LÓGICA DE TIEMPO REAL (SOCKET.IO)
// ----------------------------------------------------
// El servidor nos avisará cuando alguien presione los botones de la invitación
socket.on('actualizacionAsistencia', (datos) => {
    // Buscamos la etiqueta de estado específica de ese invitado en la tabla
    const estadoBadge = document.getElementById(`estado-${datos.token}`);
    
    if (estadoBadge) {
        // Actualizamos el texto a tiempo real
        estadoBadge.textContent = datos.nuevoEstado;
        
        // Actualizamos el color
        estadoBadge.className = 'badge'; 
        if(datos.nuevoEstado === 'Asistirá') estadoBadge.classList.add('asistira');
        if(datos.nuevoEstado === 'No asistirá') estadoBadge.classList.add('no-asistira');
    }
});

// Cargar la lista al abrir la página por primera vez
cargarInvitados();

// Función para eliminar un invitado y anular su enlace
async function eliminarInvitacion(token) {
    const confirmar = confirm("¿Estás seguro? El enlace dejará de funcionar permanentemente.");
    
    if (confirmar) {
        try {
            const respuesta = await fetch(`${API_URL}/invitados/${token}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                cargarInvitados(); // Recargamos la tabla para que desaparezca visualmente
            } else {
                alert("Hubo un problema al intentar eliminar.");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}