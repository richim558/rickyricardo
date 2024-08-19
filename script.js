document.addEventListener('DOMContentLoaded', () => {
    const actividades = [
        'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
        'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
        'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
        'Dormir 8 horas', 'Ahorrar'
    ];

    const tableBody = document.querySelector('tbody');

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

    // Cargar el estado de los botones y las evaluaciones desde Firebase
    for (let dia = 1; dia <= 31; dia++) {
        for (let actividadIndex = 0; actividadIndex < actividades.length; actividadIndex++) {
            const key = `button_${dia}_${actividadIndex}`;
            firebase.database().ref('actividades/' + key).once('value').then(snapshot => {
                const estado = snapshot.val();
                if (estado) {
                    document.getElementById(key).classList.add(`active-${estado}`);
                }
            });
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

    const key = button.id;
    const estado = button.classList.contains('active-green') ? 'green' :
                   button.classList.contains('active-yellow') ? 'yellow' :
                   button.classList.contains('active-red') ? 'red' : '';

    firebase.database().ref('actividades/' + key).set(estado);
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

    const key = select.id;
    firebase.database().ref('evaluations/' + key).set(evaluationValue);
}

function reiniciar() {
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
    console.log("Datos guardados.");
}
