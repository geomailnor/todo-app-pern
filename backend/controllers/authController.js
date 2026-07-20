import { sql } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Регистрация на нов потербител
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Моля попълнете всички полета!" });
    }

    // Проверка дали имейлът вече съществува
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: 'Този имейл вече е регистриран!'
      });
    }

    // 3. Хеширане на паролата
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Запазване на потребителя в базата данни

    const result = await sql`
      INSERT INTO users (name, email, password) 
      VALUES (${name}, ${email}, ${hashedPassword}) 
      RETURNING id, name, email
    `;

    // 5. Връщаме успешен отговор (без паролата!)
    const newUser = result[0];
    res.status(201).json({
      message: 'Регистрацията е успешна!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });


  }
  catch (error) {
    console.error('Грешка при регистрация:', error);
    res.status(500).json({ message: "Възникна грешка при регистрацията!" });
  }
};

// Логин
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Проверка дали полетата са попълнени
    if (!email || !password) {
      return res.status(400).json({
        message: 'Моля, попълнете имейл и парола!'
      });
    }

    // 2. Търси потребителя в базата
    const userResult = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (userResult.length === 0) {
      return res.status(401).json({
        message: 'Невалиден имейл или парола!'
      });
    }

    const user = userResult[0];

    // 3. Проверка на паролата
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Невалиден имейл или парола!'
      });
    }

    // 4. Генериране на JWT токен
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Токенът е валиден 7 дни
    );

    // 5. Връщаме успешен отговор с токена
    res.json({
      message: 'Успешен вход!',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Грешка при вход:', error);
    res.status(500).json({
      message: 'Възникна грешка при входа!'
    });
  }
};