let currentPage = 1;
const itemsPerPage = 15;
let allResults = [];

document.getElementById('searchButton').addEventListener('click', function () {
    const query = document.getElementById('searchInput').value;
    if (query) {
        currentPage = 1; // Сброс пагинации при новом поиске
        search(query);
    }
});

function search(query) {
    fetch(`https://dev-info-board.ru/api/v1/schedule/search/?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            allResults = prepareResults(data);
            displayResults(allResults, currentPage);
            setupPagination(allResults);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function prepareResults(data) {
    const results = [];

    if (data.groups) {
        data.groups.forEach(group => {
            results.push({
                type: 'group',
                data: group
            });
        });
    }

    if (data.employees) {
        data.employees.forEach(employee => {
            results.push({
                type: 'employee',
                data: employee
            });
        });
    }

    if (data.rooms) {
        data.rooms.forEach(room => {
            results.push({
                type: 'room',
                data: room
            });
        });
    }

    return results;
}

function displayResults(results, page) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>К сожалению, по вашему запросу ничего не найдено.</p>';
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedResults = results.slice(start, end);

    paginatedResults.forEach(item => {
        if (item.type === 'group') {
            resultsContainer.innerHTML += `
                <div class="result-item" data-group-id="${item.data.id}">
                    <h3>Группа: ${item.data.name}</h3>
                    <p>Факультет: ${item.data.faculty}</p>
                    <p>Курс: ${item.data.course_number}</p>
                </div>
            `;
        } else if (item.type === 'employee') {
            const employee = item.data;
            resultsContainer.innerHTML += `
                <div class="result-item" data-employee-id="${employee.id}">
                    <h3>Преподаватель: ${employee.last_name} ${employee.first_name} ${employee.patronymic || ''}</h3>
                    ${employee.academic_degree ? `<p>Ученая степень: ${employee.academic_degree}</p>` : ''}
                    ${employee.academic_status ? `<p>Ученое звание: ${employee.academic_status}</p>` : ''}
                </div>
            `;
        } else if (item.type === 'room') {
            resultsContainer.innerHTML += `
                <div class="result-item" data-room-id="${item.data.id}">
                    <h3>Аудитория: ${item.data.name}</h3>
                </div>
            `;
        }
    });

    // Добавляем обработчики кликов для групп
    document.querySelectorAll('.result-item[data-group-id]').forEach(item => {
        item.addEventListener('click', () => {
            const groupId = item.getAttribute('data-group-id');
            window.location.href = `group.html?group_id=${groupId}`;
        });
    });

    // Добавляем обработчики кликов для преподавателей
    document.querySelectorAll('.result-item[data-employee-id]').forEach(item => {
        item.addEventListener('click', () => {
            const employeeId = item.getAttribute('data-employee-id');
            window.location.href = `employee.html?employee_id=${employeeId}`;
        });
    });

    // Добавляем обработчики кликов для аудиторий
    document.querySelectorAll('.result-item[data-room-id]').forEach(item => {
        item.addEventListener('click', () => {
            const roomId = item.getAttribute('data-room-id');
            window.location.href = `room.html?room_id=${roomId}`;
        });
    });
}

function setupPagination(results) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const pageCount = Math.ceil(results.length / itemsPerPage);
    const maxButtons = 10; // Максимальное количество кнопок в панели навигации

    let startPage, endPage;

    if (pageCount <= maxButtons) {
        // Если страниц меньше или равно 10, показываем все
        startPage = 1;
        endPage = pageCount;
    } else {
        // Если страниц больше 10, добавляем многоточие
        if (currentPage <= 5) {
            startPage = 1;
            endPage = maxButtons - 1;
        } else if (currentPage >= pageCount - 4) {
            startPage = pageCount - (maxButtons - 2);
            endPage = pageCount;
        } else {
            startPage = currentPage - 4;
            endPage = currentPage + 4;
        }
    }

    // Кнопка "1"
    if (startPage > 1) {
        addPaginationButton(1);
        if (startPage > 2) {
            paginationContainer.innerHTML += '<span>...</span>';
        }
    }

    // Основные кнопки
    for (let i = startPage; i <= endPage; i++) {
        addPaginationButton(i);
    }

    // Кнопка последней страницы
    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            paginationContainer.innerHTML += '<span>...</span>';
        }
        addPaginationButton(pageCount);
    }

    function addPaginationButton(pageNumber) {
        const button = document.createElement('button');
        button.innerText = pageNumber;
        if (pageNumber === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = pageNumber;
            displayResults(allResults, currentPage);
            setupPagination(allResults);
        });
        paginationContainer.appendChild(button);
    }
}