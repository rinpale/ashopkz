CREATE DATABASE Ashop;

USE Ashop;
SHOW TABLES;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(256) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL  -- Добавлено поле для телефона
);

SELECT COUNT(*) AS total_users FROM users;

SELECT * FROM users;

ALTER TABLE users ADD registration_date DATETIME DEFAULT CURRENT_TIMESTAMP;

SELECT id, username, email, phone, registration_date FROM users;

CREATE TABLE votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT,
    vote_type ENUM('yes', 'no'),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


