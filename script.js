const supabaseUrl = 'https://phiqzvcnhfsxdnjyifys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInBoaXF6dmNuaGZzeGRuanlpZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNzc1NzYsImV4cCI6MjAzOTc1MzU3Nn0.MewpFDIzO59FMUoskbPLwABLwtIV-SvBRK6HFex1ycw';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

const actividades = [
    'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
    'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
    'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
    'Dormir 8 horas', 'Ahorrar'
];

// Cargar el estado de los botones y las evaluaciones desde la base de datos
document.addEventListener('DOMContentLoaded', async () => {
    const { data: actividadesData, error } = await supabase
        .from('actividades')
        .select('*');

    if (error) {
        console.error('Error al cargar datos desde la base de datos', error);
        return;
    }

    actividadesData.forEach(({ dia, actividad, estado, evaluacion }) => {
        const actividadIndex = actividades.indexOf(actividad);
        const button = document.getElementById(`button_${dia}_${actividadIndex}`);
        const select = document.getElementById(`select_${dia}_${actividadIndex}`);

        if (button && estado) {
            button.classList.add(`active-${estado}`);
        }

        if (select && evaluacion) {
            select.value = evaluacion;
            if (evaluacion === 'Muy bien') {
                select.classList.add('green');
            } else if (evaluacion === 'Necesitamos mejorar') {
                select.classList.add('yellow');
            } else if (evaluacion === 'Trabaja más') {
                select.classList.add('red');
            }
        }
    });
});

async function toggleButton(button) {
    const [dia, actividadIndex] = button.id.split('_').slice(1).map(Number);
    const actividad = actividades[actividadIndex];
    let estado = '';

    if (button.classList.contains('active-green')) {
        button.classList.remove('active-green');
        button.classList.add('active-yellow');
        estado = 'yellow';
    } else if (button.classList.contains('active-yellow')) {
        button.classList.remove('active-yellow');
        button.classList.add('active-red');
        estado = 'red';
    } else if (button.classList.contains('active-red')) {
        button.classList.remove('active-red');
    } else {
        button.classList.add('active-green');
        estado = 'green';
    }

    // Guardar en Supabase
    const { data, error } = await supabase
        .from('actividades')
        .upsert({ dia, actividad, estado });

    if (error) {
        console.error('Error al guardar en la base de datos', error);
    }
}

async function evaluate(select) {
    const [dia, actividadIndex] = select.id.split('_').slice(1).map(Number);
    const actividad = actividades[actividadIndex];
    const evaluacion = select.value;

    select.classList.remove('green', 'yellow', 'red');
    if (evaluacion === 'Muy bien') {
        select.classList.add('green');
    } else if (evaluacion === 'Necesitamos mejorar') {
        select.classList.add('yellow');
    } else if (evaluacion === 'Trabaja más') {
        select.classList.add('red');
    }

    // Guardar en Supabase
    const { data, error } = await supabase
        .from('actividades')
        .upsert({ dia, actividad, evaluacion });

    if (error) {
        console.error('Error al guardar la evaluación en la base de datos', error);
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
    const { error } = await supabase
        .from('actividades')
        .delete();

    if (error) {
        console.error('Error al limpiar la base de datos', error);
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
