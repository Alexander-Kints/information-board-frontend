document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');

    if (roomId) {
        fetchRoomSchedule(roomId);
    } else {
        alert('Аудитория не выбрана.');
    }

    // Обработчик кнопки "Вернуться к поиску"
    document.getElementById('backToSearch').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

function fetchRoomSchedule(roomId) {
    fetch(`https://dev-info-board.ru/api/v1/schedule/room-schedule/${roomId}/`)
        .then(response => response.json())
        .then(data => {
            displayRoomInfo(data);
            displayScheduleEntries(data.schedule_entries);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function displayRoomInfo(data) {
    document.getElementById('roomName').innerText = `Аудитория: ${data.name}`;
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
                            ${entry.employees && entry.employees.length > 0 ? `
                                <p><strong>${entry.employees.length === 1 ? 'Преподаватель:' : 'Преподаватели:'}</strong> 
                                ${entry.employees.map(emp => `${emp.last_name} ${emp.first_name} ${emp.patronymic || ''}`).join(', ')}</p>
                            ` : ''}
                        </div>
                    `;
                });
            }
        });
    } else {
        scheduleContainer.innerHTML = '<p>Для данной аудитории не найдено расписание.</p>';
    }
}