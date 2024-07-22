// Configuración de Firebase
const firebaseConfig = {
    // Añade aquí tu configuración de Firebase
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentCalendarId = null;

const actividades = [
    'Despertar temprano', 'Ejercicio', 'Deberes domésticos', 'Cuidado personal',
    'Respiración profunda', 'Vitaminas', 'Tarea', 'Comer sano', '2 litros de agua',
    'Ayudar', 'Tiempo solo', 'Inglés', 'Leer', 'Planificar día', 'Meditar',
    'Dormir 8 horas', 'Ahorrar'
];

document.addEventListener('DOMContentLoaded', () => {
    generateTable();
    setupAuthListeners();
    setupEventListeners();
});

function generateTable() {
    const thead = document.querySelector('#habits-table thead tr');
    for (let i = 1; i <= 31; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        thead.insertBefore(th, thead.lastElementChild);
    }

    const tbody = document.querySelector('#habits-table tbody');
    actividades.forEach((actividad, actividadIndex) => {
        const tr = document.createElement('tr');
        const tdActividad = document.createElement('td');
        tdActividad.textContent = actividad;
        tr.appendChild(tdActividad);

        for (let dia = 1; dia <= 31; dia++) {
            const td = document.createElement('td');
            const button = document.createElement('button');
            button.id = `button_${dia}_${actividadIndex}`;
            button.className = 'button';
            button.onclick = () => toggleButton(button);
            td.appendChild(button);
            tr.appendChild(td);
        }

        const tdEvaluacion = document.createElement('td');
        const select = document.createElement('select');
        select.className = 'evaluation';
        select.onchange = () => evaluate(select);
        ['', 'Muy bien', 'Necesitamos mejorar', 'Trabaja más'].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        tdEvaluacion.appendChild(select);
        tr.appendChild(tdEvaluacion);

        tbody.appendChild(tr);
    });
}

function setupAuthListeners() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    loginBtn.addEventListener('click', () => {
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            loadCalendarList();
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            document.getElementById('calendar-list').innerHTML = '';
        }
    });
}

function setupEventListeners() {
    document.getElementById('new-calendar-btn').addEventListener('click', createNewCalendar);
    document.getElementById('save-calendar-btn').addEventListener('click', saveCurrentCalendar);
    document.getElementById('load-calendar-btn').addEventListener('click', loadCalendar);
    document.getElementById('reiniciar').addEventListener('click', reiniciar);
    document.getElementById('exportar-pdf').addEventListener('click', exportarPDF);
}

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
}

function evaluate(select) {
    const evaluationValue = select.value;
    select.className = 'evaluation';
    if (evaluationValue === 'Muy bien') {
        select.classList.add('green');
    } else if (evaluationValue === 'Necesitamos mejorar') {
        select.classList.add('yellow');
    } else if (evaluationValue === 'Trabaja más') {
        select.classList.add('red');
    }
}

function reiniciar() {
    document.querySelectorAll('.button').forEach(button => {
        button.classList.remove('active-green', 'active-yellow', 'active-red');
    });

    document.querySelectorAll('.evaluation').forEach(select => {
        select.value = '';
        select.className = 'evaluation';
    });
}

function createNewCalendar() {
    const name = document.getElementById('calendar-name').value;
    if (!name) {
        alert('Por favor, ingresa un nombre para el calendario.');
        return;
    }

    currentCalendarId = db.collection('calendars').doc().id;
    saveCurrentCalendar(name);
}

function saveCurrentCalendar(name = null) {
    if (!currentUser) {
        alert('Por favor, inicia sesión para guardar el calendario.');
        return;
    }

    if (!currentCalendarId) {
        alert('Por favor, crea un nuevo calendario primero.');
        return;
    }

    const calendarData = {
        name: name || document.getElementById('calendar-name').value,
        userId: currentUser.uid,
        lastEdited: new Date(),
        data: {}
    };

    document.querySelectorAll('.button').forEach(button => {
        const [dia, actividadIndex] = button.id.split('_').slice(1).map(Number);
        if (!calendarData.data[dia]) calendarData.data[dia] = {};
        calendarData.data[dia][actividadIndex] = getButtonState(button);
    });

    document.querySelectorAll('.evaluation').forEach(select => {
        const actividadIndex = Array.from(select.parentElement.parentElement.children).indexOf(select.parentElement) - 1;
        calendarData.data[32] = calendarData.data[32] || {};
        calendarData.data[32][actividadIndex] = select.value;
    });

    db.collection('calendars').doc(currentCalendarId).set(calendarData)
        .then(() => alert('Calendario guardado con éxito'))
        .catch(error => alert('Error al guardar el calendario: ' + error.message));
}

function getButtonState(button) {
    if (button.classList.contains('active-green')) return 'green';
    if (button.classList.contains('active-yellow')) return 'yellow';
    if (button.classList.contains('active-red')) return 'red';
    return 'default';
}

function loadCalendarList() {
    if (!currentUser) return;

    db.collection('calendars')
        .where('userId', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            const calendarList = document.getElementById('calendar-list');
            calendarList.innerHTML = '';
            snapshot.forEach(doc => {
                const li = document.createElement('li');
                li.textContent = doc.data().name;
                li.onclick = () => loadCalendar(doc.id);
                calendarList.appendChild(li);
            });
        })
        .catch(error => alert('Error al cargar el historial de calendarios: ' + error.message));
}

function loadCalendar(calendarId) {
    db.collection('calendars').doc(calendarId).get()
        .then(doc => {
            if (!doc.exists) {
                alert('El calendario no existe.');
                return;
            }

            currentCalendarId = calendarId;
            const calendarData = doc.data();

            document.getElementById('calendar-name').value = calendarData.name;
            document.querySelectorAll('.button').forEach(button => {
                const [dia, actividadIndex] = button.id.split('_').slice(1).map(Number);
                const state = (calendarData.data[dia] && calendarData.data[dia][actividadIndex]) || 'default';
                setButtonState(button, state);
            });

            document.querySelectorAll('.evaluation').forEach(select => {
                const actividadIndex = Array.from(select.parentElement.parentElement.children).indexOf(select.parentElement) - 1;
                const evaluation = (calendarData.data[32] && calendarData.data[32][actividadIndex]) || '';
                select.value = evaluation;
                evaluate(select);
            });
        })
        .catch(error => alert('Error al cargar el calendario: ' + error.message));
}

function setButtonState(button, state) {
    button.classList.remove('active-green', 'active-yellow', 'active-red');
    if (state === 'green') button.classList.add('active-green');
    else if (state === 'yellow') button.classList.add('active-yellow');
    else if (state === 'red') button.classList.add('active-red');
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.text('Calendario de Hábitos', 10, 10);

    const table = document.getElementById('habits-table');
    const rows = table.querySelectorAll('tr');

    let y = 20;
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('th, td');
        let x = 10;
        cells.forEach(cell => {
            const text = cell.innerText || cell.querySelector('button')?.classList.contains('active-green') && '✔' || cell.querySelector('button')?.classList.contains('active-yellow') && '!' || cell.querySelector('button')?.classList.contains('active-red') && '✖' || '';
            pdf.text(text, x, y);
            x += 20;
        });
        y += 10;
    });

    pdf.save('calendario_habitos.pdf');
}
