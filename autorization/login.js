document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Собираем данные формы
    const formData = new FormData(this);
    const data = {
        login: formData.get('login'), // Используем 'login' для логина или email
        password: formData.get('password')
    };

    // Отправляем данные на сервер для авторизации
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Если авторизация успешна, перенаправляем на главную страницу
    if (response.ok) {
        window.location.href = '/aashop.html'; // Перенаправление на главную
    } else {
        console.error('Ошибка при авторизации');
    }
});
