let preguntas = [];
let respuestas = [];
let preguntasDisponibles = []; // Array que mantiene las preguntas aún no mostradas en este ciclo

async function cargarPreguntasDesdeArchivo() {
    try {
        const res = await fetch('preguntas.txt');
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        const texto = await res.text();
        // Split robusto para CRLF y LF, y filtrar líneas vacías
        const lineas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        preguntas = lineas.map(linea => {
            // Buscar la primera ocurrencia de '?'
            const idx = linea.indexOf('?');
            if (idx === -1) {
                // Si no hay '?', tratar toda la línea como pregunta sin respuesta
                return { pregunta: linea, respuesta: '' };
            }
            const pregunta = linea.slice(0, idx + 1).trim();
            const respuesta = linea.slice(idx + 1).trim();
            return { pregunta, respuesta };
        }).filter(p => p.pregunta && p.respuesta); // eliminar entradas incompletas
        respuestas = preguntas.map(p => p.respuesta);
        if (preguntas.length === 0) {
            document.getElementById('pregunta').textContent = 'No se encontraron preguntas válidas en preguntas.txt.';
            document.getElementById('contador').textContent = 'Preguntas restantes: 0';
            return;
        }
        // Inicializar el array de preguntas disponibles con todas las preguntas
        reiniciarCicloPreguntas();
        actualizarContador();
        cargarPregunta();
    } catch (err) {
        console.error('Error cargando preguntas:', err);
        document.getElementById('pregunta').textContent = 'Error cargando preguntas. Ver consola para detalles.';
        document.getElementById('contador').textContent = 'Error';
        // Sugerencia rápida para el usuario que abre el archivo con file://
        if (location.protocol === 'file:') {
            console.warn('Si estás abriendo index.html con file://, fetch puede fallar. Ejecuta un servidor local (ej. python -m http.server) y abre http://localhost:8000/');
        }
    }
}

function reiniciarCicloPreguntas() {
    // Copia todas las preguntas al array de disponibles
    preguntasDisponibles = [...preguntas];
    // Actualizar indicador de ciclo
    document.getElementById('ciclo').textContent = 'Nuevo ciclo iniciado';
    document.getElementById('ciclo').className = 'badge bg-success';
    setTimeout(() => {
        document.getElementById('ciclo').textContent = 'En progreso';
        document.getElementById('ciclo').className = 'badge bg-secondary';
    }, 2000);
}

function actualizarContador() {
    const contador = document.getElementById('contador');
    contador.textContent = `Preguntas restantes: ${preguntasDisponibles.length}`;

    if (preguntasDisponibles.length === 0) {
        contador.textContent = 'Ciclo completado - Reiniciando...';
        contador.className = 'badge bg-warning';
    } else if (preguntasDisponibles.length <= 3) {
        contador.className = 'badge bg-warning';
    } else {
        contador.className = 'badge bg-info';
    }
}

function cargarPregunta() {
    const contenedor = document.getElementById('opciones');
    contenedor.innerHTML = '';

    if (preguntas.length === 0) {
        document.getElementById('pregunta').textContent = 'No hay preguntas.';
        return;
    }

    // Si no quedan preguntas disponibles, reiniciar el ciclo
    if (preguntasDisponibles.length === 0) {
        reiniciarCicloPreguntas();
    }

    // Seleccionar una pregunta aleatoria del array de disponibles
    const indiceAleatorio = Math.floor(Math.random() * preguntasDisponibles.length);
    const preguntaActual = preguntasDisponibles[indiceAleatorio];

    // Remover la pregunta del array de disponibles (como sacar una carta del mazo)
    preguntasDisponibles.splice(indiceAleatorio, 1);

    document.getElementById('pregunta').textContent = preguntaActual.pregunta;

    // Actualizar el contador después de remover la pregunta
    actualizarContador();

    const respuestasOpciones = new Set();
    respuestasOpciones.add(preguntaActual.respuesta);

    while (respuestasOpciones.size < 4) {
        const aleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
        respuestasOpciones.add(aleatoria);
    }

    const opcionesArray = Array.from(respuestasOpciones);
    opcionesArray.sort(() => Math.random() - 0.5);

    for (const opcion of opcionesArray) {
        const boton = document.createElement('button');
        boton.className = 'btn btn-outline-primary btn-respuesta';
        boton.textContent = opcion;
        boton.onclick = () => {
            if (opcion === preguntaActual.respuesta) {
                boton.classList.remove('btn-outline-primary');
                boton.classList.add('correct');
                setTimeout(() => cargarPregunta(), 1000);
            } else {
                boton.classList.remove('btn-outline-primary');
                boton.classList.add('incorrect');
            }
        };
        contenedor.appendChild(boton);
    }
}

cargarPreguntasDesdeArchivo();
