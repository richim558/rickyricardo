// Inicializa Supabase
const { createClient } = supabase;
const supabaseUrl = 'https://phiqzvcnhfsxdnjyifys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXF6dmNuaGZzeGRuanlpZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNzc1NzYsImV4cCI6MjAzOTc1MzU3Nn0.MewpFDIzO59FMUoskbPLwABLwtIV-SvBRK6HFex1ycw';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    const actividades = [
        'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
        'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
        'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
        'Dormir 8 horas', 'Ahorrar'
    ];

    // Cargar el estado de los botones y las evaluaciones desde la base de datos
    const { data, error } = await supabase.from('actividades').select('*');
    if (error) {
        console.error('Error al cargar datos:', error);
        return;
    }

    data.forEach(item => {
        const button = document.getElementById(`button_${item.dia}_${item.actividad}`);
        if (button) {
            button.classList.add(item.estado);
        }
        const select = document.getElementById(`select_${item.actividad}`);
        if (select) {
            select.value = item.evaluacion;
            select.classList.add(item.evaluacion === 'Muy bien' ? 'green' : item.evaluacion === 'Necesitamos mejorar' ? 'yellow' : 'red');
        }
    });
});

async function toggleButton(button) {
    const estados = ['active-green', 'active-yellow', 'active-red'];
    let currentState = estados.findIndex(state => button.classList.contains(state));

    // Cambiar el estado del botón
    button.classList.remove(...estados);
    currentState = (currentState + 1) % estados.length;
    if (currentState >= 0) {
        button.classList.add(estados[currentState]);
    }

    // Guardar el estado en la base de datos
    const [_, dia, actividad] = button.id.split('_');
    const { error } = await supabase.from('actividades').upsert({
        dia: parseInt(dia),
        actividad: parseInt(actividad),
        estado: estados[currentState] || null
    });

    if (error) {
        console.error('Error al guardar datos:', error);
    }
}

async function evaluate(select) {
    const evaluationValue = select.value;
    select.classList.remove('green', 'yellow', 'red');
    select.classList.add(evaluationValue === 'Muy bien' ? 'green' : evaluationValue === 'Necesitamos mejorar' ? 'yellow' : 'red');

    const actividad = select.id.split('_')[1];
    const { error } = await supabase.from('actividades').upsert({
        actividad: parseInt(actividad),
        evaluacion: evaluationValue || null
    });

    if (error) {
        console.error('Error al guardar evaluación:', error);
    }
}

async function reiniciar() {
    // Reiniciar todos los botones y evaluaciones
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.classList.remove('active-green', 'active-yellow', 'active-red');
    });

    const evaluations = document.querySelectorAll('.evaluation');
    evaluations.forEach(select => {
        select.value = '';
        select.classList.remove('green', 'yellow', 'red');
    });

    // Limpiar la base de datos
    const { error } = await supabase.from('actividades').delete();

    if (error) {
        console.error('Error al reiniciar datos:', error);
    }
}

function guardar() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'captura_actividades.png';
        link.click();
    });
}
