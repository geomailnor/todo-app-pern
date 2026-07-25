import { sql } from '../config/db.js';
import bcrypt from 'bcrypt';

// Взема профила на текущия потребител
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sql`
      SELECT id, name, email, created_at FROM users WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Потребителят не е намерен' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Грешка при зареждане на профила:', error);
    res.status(500).json({ message: 'Грешка при зареждане на профила' });
  }
};

// Обновява име и имейл
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Името и имейлът са задължителни' });
    }

    // Проверка дали имейлът не се използва от друг потребител
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `;

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Този имейл вече се използва от друг потребител' });
    }

    const result = await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}
      WHERE id = ${userId}
      RETURNING id, name, email, created_at
    `;

    res.json(result[0]);
  } catch (error) {
    console.error('Грешка при обновяване на профила:', error);
    res.status(500).json({ message: 'Грешка при обновяване на профила' });
  }
};

// Промяна на парола
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Моля, попълнете текущата и новата парола' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новата парола трябва да е поне 6 символа' });
    }

    // Вземаме текущата парола от базата
    const result = await sql`
      SELECT password FROM users WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Потребителят не е намерен' });
    }

    // Проверка на текущата парола
    const isValid = await bcrypt.compare(currentPassword, result[0].password);
    if (!isValid) {
      return res.status(401).json({ message: 'Текущата парола е грешна' });
    }

    // Хеширане на новата парола
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await sql`
      UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}
    `;

    res.json({ message: 'Паролата е променена успешно' });
  } catch (error) {
    console.error('Грешка при промяна на парола:', error);
    res.status(500).json({ message: 'Грешка при промяна на паролата' });
  }
};

// Изтриване на профил
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Изтриваме потребителя (задачите ще се изтрият автоматично заради ON DELETE CASCADE)
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `;

    res.json({ message: 'Профилът е изтрит успешно' });
  } catch (error) {
    console.error('Грешка при изтриване на профила:', error);
    res.status(500).json({ message: 'Грешка при изтриване на профила' });
  }
};