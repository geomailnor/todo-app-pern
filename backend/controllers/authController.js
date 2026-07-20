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