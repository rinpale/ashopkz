const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jokerd05091',
    database: 'ashop'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Настройка сессий
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Middleware для обработки форм
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware для обслуживания статических файлов
app.use(express.static(path.join('C:/ashopkz')));

// Маршрут для корневого пути
app.get('/', (req, res) => {
    res.sendFile(path.join('C:/ashopkz/aashop.html')); // Отображаем главную страницу
});

// Маршрут для регистрации
app.post('/register', (req, res) => {
    const { username, email, password, phone } = req.body;

    // Проверяем, есть ли уже такой email или никнейм
    db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка регистрации' });
        }

        if (results.length > 0) {
            if (results[0].email === email) {
                return res.status(400).json({ field: 'email', message: 'Email уже зарегистрирован' });
            } else if (results[0].username === username) {
                return res.status(400).json({ field: 'username', message: 'Никнейм уже зарегистрирован' });
            }
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        db.query('INSERT INTO users (username, email, password, phone, registration_date) VALUES (?, ?, ?, ?, NOW())', [username, email, hashedPassword, phone], (err) => {
            if (err) return res.status(500).json({ message: 'Ошибка регистрации' });
            res.json({ message: 'Пользователь зарегистрирован' });
        });
    });
});

// Маршрут для проверки email
app.post('/check-email', (req, res) => {
    const { email } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера' });
        if (results.length > 0) {
            return res.json({ exists: true });
        }
        res.json({ exists: false });
    });
});

// Маршрут для проверки username
app.post('/check-username', (req, res) => {
    const { username } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера' });
        if (results.length > 0) {
            return res.json({ exists: true });
        }
        res.json({ exists: false });
    });
});

// Маршрут для проверки номера телефона
app.post('/check-phone', (req, res) => {
    let { phone } = req.body;

    // Преобразование номеров, начинающихся на 8, в формат +7
    if (phone.startsWith('8')) {
        phone = phone.replace(/^8/, '+7');
    }

    db.query('SELECT * FROM users WHERE phone = ?', [phone], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера' });
        if (results.length > 0) {
            return res.json({ exists: true });
        }
        res.json({ exists: false });
    });
});

// Маршрут для входа
app.post('/login', (req, res) => {
    const { login, password } = req.body;

    const isEmail = login.includes('@');
    const query = isEmail ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE username = ?';

    db.query(query, [login], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ message: 'Ошибка входа' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ message: 'Неверный пароль' });

        req.session.userId = user.id;

        // Перенаправление на главную страницу после успешной авторизации
        res.redirect('/aashop.html');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при выходе' });
        }
        res.redirect('/login.html'); // Перенаправление на страницу входа
    });
});

app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        db.query('SELECT username, avatar FROM users WHERE id = ?', [req.session.userId], (err, results) => {
            if (err || results.length === 0) {
                return res.json({ isLoggedIn: false });
            }
            res.json({
                isLoggedIn: true,
                username: results[0].username, // Можно удалить, если не требуется
                avatar: results[0].avatar || '/path/to/default-avatar.png' // Добавляем аватар
            });
        });
    } else {
        res.json({ isLoggedIn: false });
    }
});


// Убедитесь, что папка для загрузки существует
const uploadDir = path.join('C:/ashopkz', 'profile', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранения файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Путь к папке uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
});

// Фильтрация файлов по типу
const fileFilter = (req, file, cb) => {
    // Принимаем только изображения
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Неправильный формат файла'), false);
    }
};

// Настройка multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Ограничение на размер файла (5 MB)
    },
    fileFilter: fileFilter
});

// Маршрут для загрузки аватара
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        console.error('Файл не был загружен или формат неверный');
        return res.status(400).json({ message: 'Файл не загружен' });
    }

    // Логируем информацию о файле
    console.log('Загружен файл:', req.file);

    // Определяем путь к файлу аватара
    const filePath = `/profile/uploads/${req.file.filename}`; // Путь к файлу

    // Проверяем наличие userId в сессии
    if (!req.session.userId) {
        console.error('Пользователь не авторизован. userId отсутствует в сессии.');
        return res.status(400).json({ message: 'Не найден userId в сессии' });
    }

    // Логируем путь и userId
    console.log('Путь к файлу:', filePath);
    console.log('userId:', req.session.userId);

    // Обновление записи в базе данных
    db.query('UPDATE users SET avatar = ? WHERE id = ?', [filePath, req.session.userId], (err, result) => {
        if (err) {
            console.error('Ошибка при обновлении аватара:', err); // Логирование ошибки
            return res.status(500).json({ message: 'Ошибка сохранения аватара' });
        }
        res.json({ message: 'Файл успешно загружен', filePath: filePath });
    });
});

app.use('/uploads', express.static(uploadDir));

app.get('/profile-data', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    db.query('SELECT username, avatar FROM users WHERE id = ?', [req.session.userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = results[0];
        res.json({ username: user.username, avatar: user.avatar });
    });
});

app.get('/profile-data', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    db.query('SELECT username, avatar FROM users WHERE id = ?', [req.session.userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = results[0];
        res.json({ username: user.username, avatar: user.avatar });
    });
});



// Маршрут для отображения страницы регистрации
app.get('/register.html', (req, res) => {
    res.sendFile(path.join('C:/ashopkz/autorization/register.html'));
});

// Маршрут для отображения страницы входа
app.get('/login.html', (req, res) => {
    res.sendFile(path.join('C:/ashopkz/autorization/login.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
