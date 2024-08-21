// Inicialización de Supabase
const supabaseUrl = 'https://phiqzvcnhfsxdnjyifys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInBoaXF6dmNuaGZzeGRuanlpZnlzIiwicm9sIjoiYW5vbiIsImlhdCI6MTcyNDE3NzU3NiwiZXhwIjoyMDM5NzUzNTc2fQ.MewpFDIzO59FMUoskbPLwABLwtIV-SvBRK6HFex1ycw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
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
                console.error(error);
            } else if (data && data.estado) {
                const button = document.getElementById(`button_${dia}_${actividadIndex}`);
                button.classList.add(data.estado);
            }
        }
    }
});

function toggleButton(button) {
    if (button.classList.contains('active-green')) {
        button.classList.remove('active-green');
        button.classList.add('active-yellow');
    } else if (button.classList.contains('active-yellow')) {
        button.classList.remove('active-yellow');
        button.classList.add('active-red');
    } else if (button.classList.contains('active-red')) {
        button.classList.remove('active-red');
    } else {
        button.classList.add('active-green');
    }

    const estado = button.className.split(' ').find(c => c.startsWith('active-')) || '';

    const [_, dia, actividad] = button.id.split('_');
    supabase.from('actividades').upsert({
        dia: parseInt(dia),
        actividad: parseInt(actividad),
        estado: estado
    }).then(({ error }) => {
        if (error) console.error(error);
    });
}

function evaluate(select) {
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
        if (error) console.error(error);
    });
}

async function reiniciar() {
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
    if (error) console.error(error);
}

function guardar() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'captura_actividades.png';
        link.click();
    });
}
