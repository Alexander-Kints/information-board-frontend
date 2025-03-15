function updateTime() {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000); // Преобразуем в UTC
    const moscowTime = new Date(utcTime + (3 * 3600000)); // UTC+3
    const timeString = moscowTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('currentTime').innerText = `Время: ${timeString}`;
}

function fetchWeekType() {
    fetch('https://dev-info-board.ru/api/v1/schedule/week-type/')
        .then(response => response.json())
        .then(data => {
            const weekType = data.week === 'odd' ? 'Нечетная' : 'Четная';
            document.getElementById('weekType').innerText = `Неделя: ${weekType}`;
        })
        .catch(error => {
            console.error('Ошибка при получении типа недели:', error);
            document.getElementById('weekType').innerText = 'Неделя: Неизвестно';
        });
}

function initHeader() {
    updateTime();
    setInterval(updateTime, 1000); // Обновляем время каждую секунду
    fetchWeekType(); // Получаем тип недели
}

// Инициализация шапки при загрузке страницы
document.addEventListener('DOMContentLoaded', initHeader);