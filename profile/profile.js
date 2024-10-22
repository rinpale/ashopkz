document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault(); // Предотвращает перезагрузку страницы
    fetch('/logout')
        .then(response => {
            if (response.ok) {
                window.location.href = '../autorization/login.html'; // Перенаправление на страницу входа
            } else {
                alert('Ошибка при выходе');
            }
        })
        .catch(err => console.error('Ошибка выхода:', err));
});

// Получение никнейма пользователя и отображение его в правом верхнем углу
fetch('/check-session')
    .then(response => response.json())
    .then(data => {
        if (data.isLoggedIn) {
            document.getElementById('username').textContent = data.username;
        } else {
            window.location.href = '../autorization/login.html'; // Если не авторизован, перенаправляем на страницу входа
        }
    })
    .catch(err => console.error('Ошибка получения данных сессии:', err));

// Логика выхода
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('/logout')
        .then(response => {
            if (response.ok) {
                window.location.href = '../autorization/login.html'; // Перенаправление на страницу входа
            } else {
                alert('Ошибка при выходе');
            }
        })
        .catch(err => console.error('Ошибка выхода:', err));
});

// Получение данных профиля с сервера
fetch('/profile-data')
    .then(response => response.json())
    .then(data => {
        if (data.username && data.avatar) {
            // Обновляем имя пользователя
            document.getElementById('username').textContent = data.username;
            // Обновляем аватар
            document.querySelector('.profile-photo img').src = data.avatar;
        } else {
            console.error('Ошибка: данные профиля отсутствуют');
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных профиля:', error);
    });

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы

    const formData = new FormData();
    const fileField = document.getElementById('avatar');

    formData.append('avatar', fileField.files[0]);

    fetch('/upload-avatar', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.filePath) {
            // Обновляем аватар в основной секции
            document.getElementById('profile-avatar').src = data.filePath;

            // Обновляем аватар в правом верхнем углу
            document.querySelector('.right-section .profile-photo img').src = data.filePath;

            document.getElementById('upload-status').textContent = 'Аватар успешно загружен!';
        } else {
            document.getElementById('upload-status').textContent = 'Ошибка при загрузке аватара.';
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке аватара:', error);
        document.getElementById('upload-status').textContent = 'Ошибка при загрузке аватара.';
    });
});

// Когда страница загружается, делаем запрос для получения данных профиля
document.addEventListener('DOMContentLoaded', function() {
    fetch('/profile-data')
        .then(response => response.json())
        .then(data => {
            if (data.avatar) {
                // Устанавливаем аватар пользователя
                document.getElementById('profile-avatar').src = data.avatar;
            } else {
                // Если аватар не найден, можно оставить изображение по умолчанию
                document.getElementById('profile-avatar').src = '/path/to/default-avatar.png';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных профиля:', error);
        });
});
