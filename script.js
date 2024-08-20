const supabaseUrl = 'https://phiqzvcnhfsxdnjyifys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInBoaXF6dmNuaGZzeGRuanlpZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNzc1NzYsImV4cCI6MjAzOTc1MzU3Nn0.MewpFDIzO59FMUoskbPLwABLwtIV-SvBRK6HFex1ycw';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', async () => {
    const actividades = [
        'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
        'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
        'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
        'Dormir 8 horas', 'Ahorrar'
    ];

    // Cargar el estado de los botones desde Supabase
    const { data: actividadesData, error } = await supabase.from('actividades').select('*');

    if (error) {
        console.error('Error al cargar datos desde la base de datos', error);
    } else {
        actividadesData.forEach(({ dia, actividadIndex, estado, evaluacion }) => {
            const button = document.getElementById(`button_${dia}_${actividadIndex}`);
            const select = document.getElementById(`select_${actividadIndex}`);

            if (button && estado) {
                button.classList.add(estado);
            }

            if (select && evaluacion) {
                select.value = evaluacion;
                select.classList.add(evaluacion === 'Muy bien' ? 'green' :
                                     evaluacion === 'Necesitamos mejorar' ? 'yellow' :
                                     evaluacion === 'Trabaja más' ? 'red' : '');
            }
        });
    }

    // Cargar el estado de los botones y las evaluaciones desde el Local Storage como respaldo
    for (let i = 1; i <= 31; i++) {
        for (let j = 0; j < actividades.length; j++) {
            const key = `button_${i}_${j}`;
            const buttonState = localStorage.getItem(key);
            if (buttonState) {
                document.getElementById(key).classList.add(buttonState);
            }
        }
    }
});

async function toggleButton(button) {
    const [dia, actividadIndex] = button.id.split('_').slice(1).map(Number);
    let estado = '';

    if (button.classList.contains('active-green')) {
        button.classList.remove('active-green');
        button.classList.add('active-yellow');
        estado = 'active-yellow';
    } else if (button.classList.contains('active-yellow')) {
        button.classList.remove('active-yellow');
        button.classList.add('active-red');
        estado = 'active-red';
    } else if (button.classList.contains('active-red')) {
        button.classList.remove('active-red');
        estado = '';
    } else {
        button.classList.add('active-green');
        estado = 'active-green';
    }

    // Guardar el estado del botón en Supabase y Local Storage
    const { error } = await supabase.from('actividades').upsert({ dia, actividadIndex, estado });

    if (error) {
        console.error('Error al guardar en la base de datos', error);
    } else {
        localStorage.setItem(button.id, estado);
    }
}

async function evaluate(select) {
    const actividadIndex = select.id.split('_')[1];
    const evaluacion = select.value;

    select.classList.remove('green', 'yellow', 'red');
    select.classList.add(evaluacion === 'Muy bien' ? 'green' :
                         evaluacion === 'Necesitamos mejorar' ? 'yellow' :
                         evaluacion === 'Trabaja más' ? 'red' : '');

    // Guardar la evaluación en Supabase y Local Storage
    const { error } = await supabase.from('actividades').upsert({ actividadIndex, evaluacion });

    if (error) {
        console.error('Error al guardar la evaluación en la base de datos', error);
    } else {
        localStorage.setItem(select.id, evaluacion);
    }
}

async function reiniciar() {
    // Reiniciar todos los botones y evaluaciones
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.classList.remove('active-green', 'active-yellow', 'active-red');
        localStorage.removeItem(button.id);
    });

    const evaluations = document.querySelectorAll('.evaluation');
    evaluations.forEach(select => {
        select.value = '';
        select.classList.remove('green', 'yellow', 'red');
        localStorage.removeItem(select.id);
    });

    // Limpiar la base de datos
    const { error } = await supabase.from('actividades').delete();

    if (error) {
        console.error('Error al reiniciar la base de datos', error);
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


// Inicializa Supabase
const supabaseUrl = 'https://phiqzvcnhfsxdnjyifys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXF6dmNuaGZzeGRuanlpZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNzc1NzYsImV4cCI6MjAzOTc1MzU3Nn0.MewpFDIzO59FMUoskbPLwABLwtIV-SvBRK6HFex1ycw';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Define las actividades para usarlas en múltiples funciones
const actividades = [
    'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
    'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
    'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
    'Dormir 8 horas', 'Ahorrar'
];

// Cargar el estado de los botones y las evaluaciones desde Supabase
document.addEventListener('DOMContentLoaded', async (event) => {
    for (let i = 1; i <= 31; i++) {
        for (let j = 0; j < actividades.length; j++) {
            const buttonId = `button_${i}_${j}`;
            const { data, error } = await supabase
                .from('actividades')
                .select('estado')
                .eq('id', buttonId)
                .single();

            if (data) {
                document.getElementById(buttonId).classList.add(data.estado);
            }
        }
    }
});

async function toggleButton(button) {
    const buttonId = button.id;
    let newState;

    if (button.classList.contains('active-green')) {
        button.classList.remove('active-green');
        button.classList.add('active-yellow');
        newState = 'active-yellow';
    } else if (button.classList.contains('active-yellow')) {
        button.classList.remove('active-yellow');
        button.classList.add('active-red');
        newState = 'active-red';
    } else if (button.classList.contains('active-red')) {
        button.classList.remove('active-red');
        newState = null;
    } else {
        button.classList.add('active-green');
        newState = 'active-green';
    }

    const { error } = await supabase
        .from('actividades')
        .upsert({ id: buttonId, estado: newState });

    if (error) console.error('Error al actualizar el estado:', error);
}

async function evaluate(select) {
    const evaluationValue = select.value;
    const selectId = select.id;

    select.classList.remove('green', 'yellow', 'red');
    if (evaluationValue === 'Muy bien') {
        select.classList.add('green');
    } else if (evaluationValue === 'Necesitamos mejorar') {
        select.classList.add('yellow');
    } else if (evaluationValue === 'Trabaja más') {
        select.classList.add('red');
    }

    const { error } = await supabase
        .from('evaluaciones')
        .upsert({ id: selectId, evaluacion: evaluationValue });

    if (error) console.error('Error al actualizar la evaluación:', error);
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

    // Eliminar todos los registros en la tabla de Supabase
    let { error: error1 } = await supabase.from('actividades').delete().neq('id', null);
    let { error: error2 } = await supabase.from('evaluaciones').delete().neq('id', null);

    if (error1 || error2) console.error('Error al reiniciar los datos:', error1 || error2);
}

function guardar() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'captura_actividades.png';
        link.click();
    });
}

