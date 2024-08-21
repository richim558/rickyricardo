// Inicializar Supabase
const supabaseUrl = 'https://phiqzvcnhfsxdnjyifys.supabase.co';
const supabaseKey = 'tu-api-key';  // Reemplaza esto con tu API key real
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Array de actividades
const actividades = [
    'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
    'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
    'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
    'Dormir 8 horas', 'Ahorrar'
];

// Cargar el estado inicial de la página
document.addEventListener('DOMContentLoaded', async () => {
    await cargarEstadoDesdeBaseDeDatos();
});

async function cargarEstadoDesdeBaseDeDatos() {
    for (let dia = 1; dia <= 31; dia++) {
        for (let i = 0; i < actividades.length; i++) {
            const { data, error } = await supabase
                .from('actividades')
                .select('estado, evaluacion')
                .eq('dia', dia)
                .eq('actividad', i)
                .single();

            if (data) {
                const buttonId = `button_${dia}_${i}`;
                const selectId = `select_${dia}_${i}`;

                // Restaurar estado de los botones
                if (data.estado) {
                    const button = document.getElementById(buttonId);
                    button.classList.add(data.estado);
                }

                // Restaurar evaluaciones
                if (data.evaluacion) {
                    const select = document.getElementById(selectId);
                    select.value = data.evaluacion;
                    actualizarColorEvaluacion(select);
                }
            }
        }
    }
}

function toggleButton(button) {
    const estados = ['active-green', 'active-yellow', 'active-red'];
    const currentClass = estados.find(estado => button.classList.contains(estado));

    if (currentClass) {
        button.classList.remove(currentClass);
        const nextClass = estados[(estados.indexOf(currentClass) + 1) % estados.length];
        button.classList.add(nextClass);
    } else {
        button.classList.add('active-green');
    }

    const estadoActual = button.classList.contains('active-green') ? 'active-green' :
                        button.classList.contains('active-yellow') ? 'active-yellow' :
                        button.classList.contains('active-red') ? 'active-red' : '';

    guardarEstadoEnBaseDeDatos(button.id, estadoActual);
}

async function guardarEstadoEnBaseDeDatos(id, estado) {
    const [ , dia, actividadIndex ] = id.split('_');
    const { data, error } = await supabase
        .from('actividades')
        .upsert({ dia: parseInt(dia), actividad: parseInt(actividadIndex), estado: estado });

    if (error) console.error('Error al guardar estado:', error);
}

function evaluate(select) {
    actualizarColorEvaluacion(select);
    guardarEvaluacionEnBaseDeDatos(select.id, select.value);
}

function actualizarColorEvaluacion(select) {
    select.classList.remove('green', 'yellow', 'red');

    if (select.value === 'Muy bien') {
        select.classList.add('green');
    } else if (select.value === 'Necesitamos mejorar') {
        select.classList.add('yellow');
    } else if (select.value === 'Trabaja más') {
        select.classList.add('red');
    }
}

async function guardarEvaluacionEnBaseDeDatos(id, evaluacion) {
    const [ , dia, actividadIndex ] = id.split('_');
    const { data, error } = await supabase
        .from('actividades')
        .upsert({ dia: parseInt(dia), actividad: parseInt(actividadIndex), evaluacion: evaluacion });

    if (error) console.error('Error al guardar evaluación:', error);
}

function reiniciar() {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.className = 'button';
    });

    const evaluations = document.querySelectorAll('.evaluation');
    evaluations.forEach(select => {
        select.value = '';
        actualizarColorEvaluacion(select);
    });

    limpiarBaseDeDatos();
}

async function limpiarBaseDeDatos() {
    const { error } = await supabase
        .from('actividades')
        .delete()
        .not('id', 'is', null);

    if (error) console.error('Error al limpiar la base de datos:', error);
}

function guardar() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'captura_actividades.png';
        link.click();
    });
}
