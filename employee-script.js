document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('employee_id');

    if (employeeId) {
        fetchEmployeeSchedule(employeeId);
    } else {
        alert('Преподаватель не выбран.');
    }

    // Обработчик кнопки "Вернуться к поиску"
    document.getElementById('backToSearch').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

function fetchEmployeeSchedule(employeeId) {
    fetch(`https://dev-info-board.ru/api/v1/schedule/employee-schedule/${employeeId}/`)
        .then(response => response.json())
        .then(data => {
            displayEmployeeInfo(data);
            displayContacts(data.contacts);
            displayScheduleEntries(data.schedule_entries);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function displayEmployeeInfo(data) {
    const employeeInfo = document.getElementById('employeeInfo');
    employeeInfo.innerHTML = `
        <img src="${data.photo}" alt="Фото преподавателя">
        <h2>${data.last_name} ${data.first_name} ${data.patronymic || ''}</h2>
        ${data.academic_degree ? `<p>Ученая степень: ${data.academic_degree}</p>` : ''}
        ${data.academic_status ? `<p>Ученое звание: ${data.academic_status}</p>` : ''}
        ${data.current_positions && data.current_positions.length > 0 ? `<p>${data.current_positions.length === 1 ? 'Должность:' : 'Должности:'}</p>` : ''}
        ${data.current_positions && data.current_positions.length > 0 ? data.current_positions.map(pos => `<p>${pos}</p>`).join('') : ''}
    `;
}

function displayContacts(contacts) {
    const contactsContainer = document.getElementById('contacts');
    if (contacts && contacts.length > 0) {
        contactsContainer.innerHTML = '<h3>Контакты:</h3>';
        contacts.forEach(contact => {
            let icon = '';
            switch (contact.contact_type) {
                case 'Phone':
                    icon = '📞';
                    break;
                case 'Email':
                    icon = '📧';
                    break;
                case 'Address':
                    icon = '📍';
                    break;
            }
            contactsContainer.innerHTML += `<p>${icon} ${contact.value}</p>`;
        });
    } else {
        contactsContainer.innerHTML = '';
    }
}

function displayScheduleEntries(scheduleEntries) {
    const scheduleContainer = document.getElementById('scheduleEntries');
    if (scheduleEntries && scheduleEntries.length > 0) {
        // Группируем расписание по дням недели
        const groupedByDay = scheduleEntries.reduce((acc, entry) => {
            if (!acc[entry.day_of_week]) {
                acc[entry.day_of_week] = [];
            }
            acc[entry.day_of_week].push(entry);
            return acc;
        }, {});

        // Сортируем дни недели в правильном порядке
        const daysOrder = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
        scheduleContainer.innerHTML = '<h3>Расписание:</h3>';

        daysOrder.forEach(day => {
            if (groupedByDay[day]) {
                scheduleContainer.innerHTML += `<h4>${day.charAt(0).toUpperCase() + day.slice(1)}</h4>`;

                // Сортируем записи по времени
                groupedByDay[day].sort((a, b) => {
                    const timeA = a.study_time.split('-')[0];
                    const timeB = b.study_time.split('-')[0];
                    return timeA.localeCompare(timeB);
                });

                groupedByDay[day].forEach(entry => {
                    scheduleContainer.innerHTML += `
                        <div class="schedule-entry">
                            <p><strong>Группа:</strong> ${entry.group_name}</p>
                            ${entry.subgroup ? `<p><strong>Подгруппа:</strong> ${entry.subgroup}</p>` : ''}
                            <p><strong>Предмет:</strong> ${entry.subject}</p>
                            <p><strong>Тип занятия:</strong> ${entry.subject_type}</p>
                            <p><strong>Время:</strong> ${entry.study_time}</p>
                            <p><strong>Аудитория:</strong> ${entry.room || 'Не указана'}</p>
                            ${entry.employees && entry.employees.length > 1 ? `<p><strong>Преподаватели:</strong> ${entry.employees.map(emp => `${emp.last_name} ${emp.first_name} ${emp.patronymic || ''}`).join(', ')}</p>` : ''}
                        </div>
                    `;
                });
            }
        });
    } else {
        scheduleContainer.innerHTML = '<p>Для данного преподавателя не найдено расписание.</p>';
    }
}