document.addEventListener('DOMContentLoaded', (event) => {
    const actividades = [
        'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
        'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
        'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
        'Dormir 8 horas', 'Ahorrar'
    ];

    // Cargar el estado de los botones y las evaluaciones desde el Local Storage
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

    // Guardar el estado del botón en el Local Storage
    const key = button.id;
    if (button.classList.contains('active-green')) {
        localStorage.setItem(key, 'active-green');
    } else if (button.classList.contains('active-yellow')) {
        localStorage.setItem(key, 'active-yellow');
    } else if (button.classList.contains('active-red')) {
        localStorage.setItem(key, 'active-red');
    } else {
        localStorage.removeItem(key);
    }
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

    // Guardar el estado de la evaluación en el Local Storage
    const key = select.id;
    if (evaluationValue) {
        localStorage.setItem(key, evaluationValue);
    } else {
        localStorage.removeItem(key);
    }
}

function reiniciar() {
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

    // Limpiar el Local Storage
    localStorage.clear();
}

function guardar() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Registro de Actividades', 105, 15, null, null, 'center');

    // Configuración de la tabla
    const headers = ['Actividad', 'Estado'];
    const data = [];

    // Obtener datos de los botones y evaluaciones
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const actividad = row.querySelector('td:first-child').textContent;
        const buttons = row.querySelectorAll('.button');
        const evaluation = row.querySelector('.evaluation');

        let estado = '';
        buttons.forEach((button, index) => {
            if (button.classList.contains('active-green')) {
                estado += `D${index + 1}: Verde, `;
            } else if (button.classList.contains('active-yellow')) {
                estado += `D${index + 1}: Amarillo, `;
            } else if (button.classList.contains('active-red')) {
                estado += `D${index + 1}: Rojo, `;
            }
        });

        if (evaluation.value) {
            estado += `Evaluación: ${evaluation.value}`;
        }

        data.push([actividad, estado]);
    });

    // Generar la tabla en el PDF
    doc.autoTable({
        head: [headers],
        body: data,
        startY: 25,
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 140 } },
    });

    // Guardar el PDF
    doc.save('registro_actividades.pdf');
}
