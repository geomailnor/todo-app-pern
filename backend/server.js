import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

import todoRoutes from './routes/todoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { sql } from './config/db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

async function initDB() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS todos(
    id SERIAL PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    console.log('✅ Таблица todos инициализирана!');

    await sql`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Таблица users инициализирана');

    // Добавяне на user_id в todos (ако не съществува)
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'todos' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE todos ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `;
    console.log('✅ Колона user_id добавена към todos');
  }
  catch (error) {
    console.log('Error init DB', error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

