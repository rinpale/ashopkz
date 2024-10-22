// Функция для проверки email в реальном времени
async function checkEmail(email) {
    const response = await fetch('/check-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    const result = await response.json();
    return result.exists; // Возвращает true, если email уже занят
}

// Функция для проверки username в реальном времени
async function checkUsername(username) {
    const response = await fetch('/check-username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });

    const result = await response.json();
    return result.exists; // Возвращает true, если username уже занят
}

// Функция для проверки номера телефона
async function checkPhone(phone) {
    const response = await fetch('/check-phone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    });

    const result = await response.json();
    return result.exists; // Возвращает true, если номер телефона уже занят
}

// Проверка номера телефона в реальном времени
document.querySelector('input[name="phone"]').addEventListener('input', async function () {
    const phone = this.value;
    if (phone) {
        const phoneExists = await checkPhone(phone);
        if (phoneExists) {
            document.getElementById('phoneError').textContent = 'Данный номер телефона уже зарегистрирован';
            document.getElementById('phoneError').style.display = 'block';
            document.querySelector('input[name="phone"]').classList.add('error');
        } else {
            document.getElementById('phoneError').textContent = '';
            document.getElementById('phoneError').style.display = 'none';
            document.querySelector('input[name="phone"]').classList.remove('error');
        }
    }
});

// Функция для нормализации номеров
function normalizePhone(phone) {
    if (phone.startsWith('8')) {
        return phone.replace(/^8/, '+7');
    }
    return phone;
}

// Проверка номера телефона в реальном времени
document.querySelector('input[name="phone"]').addEventListener('input', async function () {
    let phone = this.value;
    phone = normalizePhone(phone);  // Нормализация номера

    if (phone) {
        const phoneExists = await checkPhone(phone);
        if (phoneExists) {
            document.getElementById('phoneError').textContent = 'Данный номер телефона уже зарегистрирован';
            document.getElementById('phoneError').style.display = 'block';
            document.querySelector('input[name="phone"]').classList.add('error');
        } else {
            document.getElementById('phoneError').textContent = '';
            document.getElementById('phoneError').style.display = 'none';
            document.querySelector('input[name="phone"]').classList.remove('error');
        }
    }
});



// Обработчики ввода для динамической проверки и удаления ошибок
document.querySelector('input[name="email"]').addEventListener('input', async function () {
    const email = this.value;
    if (email) {
        const emailExists = await checkEmail(email);
        if (emailExists) {
            document.getElementById('emailError').textContent = 'Данный email уже зарегистрирован';
            document.getElementById('emailError').style.display = 'block';
            document.querySelector('input[name="email"]').classList.add('error');
        } else {
            document.getElementById('emailError').textContent = '';
            document.getElementById('emailError').style.display = 'none';
            document.querySelector('input[name="email"]').classList.remove('error');
        }
    }
});

document.querySelector('input[name="username"]').addEventListener('input', async function () {
    const username = this.value;
    if (username) {
        const usernameExists = await checkUsername(username);
        if (usernameExists) {
            document.getElementById('usernameError').textContent = 'Данный никнейм уже занят';
            document.getElementById('usernameError').style.display = 'block';
            document.querySelector('input[name="username"]').classList.add('error');
        } else {
            document.getElementById('usernameError').textContent = '';
            document.getElementById('usernameError').style.display = 'none';
            document.querySelector('input[name="username"]').classList.remove('error');
        }
    }
});

// Проверка паролей на совпадение
document.querySelector('input[name="confirm_password"]').addEventListener('input', function () {
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = this.value;

    if (password !== confirmPassword) {
        document.getElementById('passwordError').textContent = 'Пароли не совпадают';
        document.getElementById('passwordError').style.display = 'block';
        document.querySelector('input[name="confirm_password"]').classList.add('error');
    } else {
        document.getElementById('passwordError').textContent = '';
        document.getElementById('passwordError').style.display = 'none';
        document.querySelector('input[name="confirm_password"]').classList.remove('error');
    }
});

// Обработка формы при отправке
document.getElementById('registrationForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Отменяем стандартное поведение формы

    // Очистка сообщений об ошибках и классов ошибок
    document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    document.querySelectorAll('.form-input__field').forEach(e => e.classList.remove('error'));

    // Собираем данные формы
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Проверка на совпадение паролей
    if (data.password !== data.confirm_password) {
        document.getElementById('passwordError').textContent = 'Пароли не совпадают';
        document.getElementById('passwordError').style.display = 'block';
        document.querySelector('input[name="confirm_password"]').classList.add('error');
        return; // Останавливаем выполнение скрипта
    }

    // Отправляем данные на сервер
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Если регистрация успешна
        if (response.ok) {
            window.location.href = '../aashop.html'; // Переход на главную страницу
        } else {
            const errorData = await response.json();

            if (errorData.field === 'email') {
                document.getElementById('emailError').textContent = 'Данный email уже зарегистрирован';
                document.getElementById('emailError').style.display = 'block';
                document.querySelector('input[name="email"]').classList.add('error');
            }
            if (errorData.field === 'username') {
                document.getElementById('usernameError').textContent = 'Данный никнейм уже занят';
                document.getElementById('usernameError').style.display = 'block';
                document.querySelector('input[name="username"]').classList.add('error');
            }
        }
    } catch (error) {
        alert(error.message); // Сообщение об ошибке в случае проблем с сервером
    }
});
