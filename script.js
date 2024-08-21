// Inicialización de Supabase
const supabaseUrl = 'https://phiqzvcnhfsxdnjyifys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInBoaXF6dmNuaGZzeGRuanlpZnlzIiwicm9sIjoiYW5vbiIsImlhdCI6MTcyNDE3NzU3NiwiZXhwIjoyMDM5NzUzNTc2fQ.MewpFDIzO59FMUoskbPLwABLwtIV-SvBRK6HFex1ycw';
let supabase;

// Espera que el DOM esté cargado antes de inicializar Supabase
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar Supabase
    supabase = supabase.createClient(supabaseUrl, supabaseKey);

    const actividades = [
        'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
        'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
        'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
        'Dormir 8 horas', 'Ahorrar'
    ];

    // Recuperar estado de los botones desde Supabase
    for (let dia = 1; dia <= 31; dia++) {
        for (let actividadIndex = 0; actividadIndex < actividades.length; actividadIndex++) {
            const { data, error } = await supabase
                .from('actividades')
                .select('estado')
                .eq('dia', dia)
                .eq('actividad', actividadIndex)
                .single();

            if (error) {
                console.error('Error recuperando el estado:', error);
            } else if (data && data.estado) {
                const button = document.getElementById(`button_${dia}_${actividadIndex}`);
                button.classList.add(data.estado);
            }
        }
    }
});

function toggleButton(button) {
    if (!supabase) {
        console.error('Supabase no está inicializado.');
        return;
    }

    const currentClass = ['active-green', 'active-yellow', 'active-red'];
    const currentState = button.className.split(' ').find(c => currentClass.includes(c));

    if (currentState === 'active-green') {
        button.classList.replace('active-green', 'active-yellow');
    } else if (currentState === 'active-yellow') {
        button.classList.replace('active-yellow', 'active-red');
    } else if (currentState === 'active-red') {
        button.classList.remove('active-red');
    } else {
        button.classList.add('active-green');
    }

    const estado = button.className.split(' ').find(c => currentClass.includes(c)) || '';

    const [_, dia, actividad] = button.id.split('_');
    supabase.from('actividades').upsert({
        dia: parseInt(dia),
        actividad: parseInt(actividad),
        estado: estado
    }).then(({ error }) => {
        if (error) console.error('Error guardando el estado:', error);
    });
}

function evaluate(select) {
    if (!supabase) {
        console.error('Supabase no está inicializado.');
        return;
    }

    const evaluationValue = select.value;
    select.classList.remove('green', 'yellow', 'red');
    if (evaluationValue === 'Muy bien') {
        select.classList.add('green');
    } else if (evaluationValue === 'Necesitamos mejorar') {
        select.classList.add('yellow');
    } else if (evaluationValue === 'Trabaja más') {
        select.classList.add('red');
    }

    const [_, dia, actividad] = select.id.split('_');
    supabase.from('actividades').upsert({
        dia: parseInt(dia),
        actividad: parseInt(actividad),
        evaluacion: evaluationValue
    }).then(({ error }) => {
        if (error) console.error('Error guardando la evaluación:', error);
    });
}

async function reiniciar() {
    if (!supabase) {
        console.error('Supabase no está inicializado.');
        return;
    }

    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.classList.remove('active-green', 'active-yellow', 'active-red');
    });

    const evaluations = document.querySelectorAll('.evaluation');
    evaluations.forEach(select => {
        select.value = '';
        select.classList.remove('green', 'yellow', 'red');
    });

    const { error } = await supabase.from('actividades').delete();
    if (error) console.error('Error reiniciando:', error);
}

function guardar() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'captura_actividades.png';
        link.click();
    });
}
