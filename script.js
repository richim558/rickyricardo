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

        const dailyKey = `daily_evaluation_${i}`;
        const dailyEvaluationState = localStorage.getItem(dailyKey);
        if (dailyEvaluationState) {
            const dailySelect = document.getElementById(dailyKey);
            dailySelect.value = dailyEvaluationState;
            dailySelect.classList.add(dailyEvaluationState.toLowerCase().replace(' ', '-'));
            updateDailyResult(i, dailyEvaluationState);
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

    // Actualizar la fila de resultados diarios
    const dia = key.split('_')[2];
    updateDailyResult(dia, evaluationValue);
}

function updateDailyResult(dia, evaluationValue) {
    const resultCell = document.getElementById(`daily_result_${dia}`);
    if (evaluationValue === 'Muy bien') {
        resultCell.innerHTML = '😊';
    } else if (evaluationValue === 'Necesitamos mejorar') {
        resultCell.innerHTML = '😯';
    } else if (evaluationValue === 'Trabaja más') {
        resultCell.innerHTML = '😢';
    } else {
        resultCell.innerHTML = '';
    }
}
