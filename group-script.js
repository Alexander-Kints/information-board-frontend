document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('group_id');

    if (groupId) {
        fetchGroupSchedule(groupId);
    } else {
        alert('Группа не выбрана.');
    }

    // Обработчик кнопки "Вернуться к поиску"
    document.getElementById('backToSearch').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

function fetchGroupSchedule(groupId) {
    fetch(`https://dev-info-board.ru/api/v1/schedule/group-schedule/${groupId}/`)
        .then(response => response.json())
        .then(data => {
            displayGroupInfo(data);
            if (data.subgroups.length > 1) {
                displaySubgroupSelector(data.subgroups);
            } else {
                displaySchedule(data.subgroups[0].schedule_entries);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function displayGroupInfo(data) {
    document.getElementById('groupName').innerText = `Группа: ${data.name}`;
    document.getElementById('groupInfo').innerText = `Факультет: ${data.faculty}, Курс: ${data.course_number}`;
}

function displaySubgroupSelector(subgroups) {
    const selector = document.getElementById('subgroupSelector');
    subgroups.forEach((subgroup, index) => {
        const button = document.createElement('button');
        button.innerText = `Подгруппа ${subgroup.number}`;
        button.addEventListener('click', () => {
            displaySchedule(subgroup.schedule_entries);
            document.querySelectorAll('#subgroupSelector button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
        if (index === 0) {
            button.classList.add('active');
            displaySchedule(subgroup.schedule_entries);
        }
        selector.appendChild(button);
    });
}

function displaySchedule(scheduleEntries) {
    const tableBody = document.querySelector('#scheduleTable tbody');
    tableBody.innerHTML = '';

    const daysOfWeek = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    const timeSlots = Array.from({ length: 6 }, (_, i) => i + 1);

    timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.innerText = timeSlot;
        row.appendChild(timeCell);

        daysOfWeek.forEach(day => {
            const cell = document.createElement('td');
            const entries = scheduleEntries.filter(entry => entry.day_of_week === day && entry.subject_number === timeSlot);

            if (entries.length > 0) {
                entries.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'schedule-entry';

                    if (entry.subject) {
                        const subject = document.createElement('p');
                        subject.innerText = entry.subject;
                        entryDiv.appendChild(subject);
                    }

                    if (entry.employees && entry.employees.length > 0) {
                        const employees = entry.employees.map(emp => `${emp.last_name} ${emp.first_name} ${emp.patronymic || ''}`).join(', ');
                        const employeeP = document.createElement('p');
                        // Проверяем количество преподавателей
                        if (entry.employees.length > 1) {
                            employeeP.innerText = `Преподаватели: ${employees}`;
                        } else {
                            employeeP.innerText = `Преподаватель: ${employees}`;
                        }
                        entryDiv.appendChild(employeeP);
                    }

                    if (entry.room) {
                        const roomP = document.createElement('p');
                        roomP.innerText = `Аудитория: ${entry.room}`;
                        entryDiv.appendChild(roomP);
                    }

                    if (entry.study_time) {
                        const timeP = document.createElement('p');
                        timeP.innerText = `Время: ${entry.study_time}`;
                        entryDiv.appendChild(timeP);
                    }

                    if (entry.subject_type) {
                        const typeP = document.createElement('p');
                        typeP.innerText = `Тип: ${entry.subject_type}`;
                        entryDiv.appendChild(typeP);
                    }

                    cell.appendChild(entryDiv);
                });
            } else {
                // Пустая ячейка
                cell.innerHTML = '&nbsp;'; // Неразрывный пробел для сохранения размера ячейки
            }

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}