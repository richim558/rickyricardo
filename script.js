document.addEventListener('DOMContentLoaded', (event) => {
    const actividades = [
        'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
        'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
        'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
        'Dormir 8 horas', 'Ahorrar'
    ];

    const tableHead = document.querySelector('thead tr');
    const tableBody = document.querySelector('tbody');

    // Crear encabezados de días del mes
    for (let i = 1; i <= 31; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        tableHead.appendChild(th);
    }

    // Crear filas para cada actividad
    actividades.forEach((actividad, actividadIndex) => {
        const tr = document.createElement('tr');
        const tdActividad = document.createElement('td');
        tdActividad.textContent = actividad;
        tr.appendChild(tdActividad);

        for (let dia = 1; dia <= 31; dia++) {
            const td = document.createElement('td');
            const button = document.createElement('button');
            button.id = `button_${dia}_${actividadIndex}`;
            button.classList.add('button');
            button.addEventListener('click', () => toggleButton(button));
            td.appendChild(button);
            tr.appendChild(td);
        }

        const tdEval = document.createElement('td');
        const select = document.createElement('select');
        select.classList.add('evaluation');
        select.innerHTML = `<option value=""></option>
                            <option value="Muy bien">Muy bien</option>
                            <option value="Necesitamos mejorar">Necesitamos mejorar</option>
                            <option value="Trabaja más">Trabaja más</option>`;
        select.addEventListener('change', () => evaluate(select));
        tdEval.appendChild(select);
        tr.appendChild(tdEval);

        tableBody.appendChild(tr);
    });

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

    // Guardar el estado del botón en Firebase
    const key = button.id;
    const estado = button.classList.contains('active-green') ? 'green' :
                   button.classList.contains('active-yellow') ? 'yellow' :
                   button.classList.contains('active-red') ? 'red' : 'gray';

    firebase.database().ref('actividades/' + key).set(estado)
        .catch((error) => {
            console.error("Error al guardar el estado en Firebase:", error);
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

    // Guardar el estado de la evaluación en Firebase
    const key = select.id;
    firebase.database().ref('evaluations/' + key).set(evaluationValue)
        .catch((error) => {
            console.error("Error al guardar la evaluación en Firebase:", error);
        });
}

function reiniciar() {
    // Reiniciar todos los botones y evaluaciones
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.classList.remove('active-green', 'active-yellow', 'active-red');
        firebase.database().ref('actividades/' + button.id).remove();
    });

    const evaluations = document.querySelectorAll('.evaluation');
    evaluations.forEach(select => {
        select.value = '';
        select.classList.remove('green', 'yellow', 'red');
        firebase.database().ref('evaluations/' + select.id).remove();
    });

    console.log("Datos reiniciados.");
}

function guardar() {
    // No es necesario guardar explícitamente si los cambios ya se guardan automáticamente en Firebase
    console.log("Datos guardados.");
}
