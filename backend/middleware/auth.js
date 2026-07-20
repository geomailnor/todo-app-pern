import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  try {
    // Вземи токена от header-а
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Липсва или е невалиден токен!'
      });
    }

    // Извлечи токена (без "Bearer ")
    const token = authHeader.split(' ')[1];

    // Верифицирай токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Добави потребителя към req обекта
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };

    next(); // Продължи към следващия middleware/контролер
  } catch (error) {
    console.error('Грешка при автентикация:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Невалиден токен!' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токенът е изтекъл!' });
    }

    res.status(500).json({ message: 'Грешка при автентикация!' });
  }
};