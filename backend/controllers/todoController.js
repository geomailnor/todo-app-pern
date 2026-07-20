import { sql } from "../config/db.js";

// CRUD Operations

// ============================================
// ВЗИМА ВСИЧКИ ЗАДАЧИ (САМО НА ТЕКУЩИЯ ПОТРЕБИТЕЛ)
// ============================================
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id; // Вземаме от JWT токена
    const tasks = await sql`
    SELECT * FROM todos
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    `;
    // console.log('feched products', tasks);
    res.status(200).json({ tasks });
  } catch (error) {
    console.log('Error in getTasks function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ============================================
// СЪЗДАВА НОВА ЗАДАЧА (ЗА ТЕКУЩИЯ ПОТРЕБИТЕЛ)
// ============================================
export const createTask = async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ success: false, message: 'Task field are required!' });
  }
  try {
    const userId = req.user.id; // Вземаме от JWT токена
    const newTask = await sql`
    INSERT INTO todos (task, completed, user_id)
    VALUES (${task}, false, ${userId})
    RETURNING *
    `;
    // console.log('New task added', newTask);
    res.status(201).json(newTask[0]);

  } catch (error) {
    console.log('Error in createTask function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ============================================
// ВЗИМА ЕДНА ЗАДАЧА (САМО АКО Е НА ТЕКУЩИЯ ПОТРЕБИТЕЛ)
// ============================================
export const getTask = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid task id (Not a number)' });
  }
  try {
    const userId = req.user.id;
    const task = await sql`
    SELECT * FROM todos WHERE id=${id} AND user_id = ${userId}
    `;
    if (task.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found!' });
    }
    res.status(200).json(task[0]);

  } catch (error) {
    console.log('Error in getTask function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ============================================
// ПРОМЕНЯ СТАТУСА НА ЗАДАЧА (САМО АКО Е НА ТЕКУЩИЯ ПОТРЕБИТЕЛ)
// ============================================
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Status must be "true" or "false"' });
  }
  try {
    const userId = req.user.id;
    const updateTask = await sql`
    UPDATE todos
    SET completed=${completed}
    WHERE id=${id} AND user_id = ${userId}
    RETURNING *
    `;
    if (updateTask.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found!' });
    }

    res.status(200).json(updateTask[0]);

  } catch (error) {
    console.log('Error in updateTask function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ============================================
// ПРОМЕНЯ ТЕКСТА НА ЗАДАЧА (САМО АКО Е НА ТЕКУЩИЯ ПОТРЕБИТЕЛ)
// ============================================
export const updateTaskText = async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  if (!task || !task.trim()) {
    return res.status(400).json({ success: false, message: 'Task text is required!' });
  }
  try {
    const userId = req.user.id;
    const updateTask = await sql`
    UPDATE todos
    SET task = ${task}
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
    `;
    if (updateTask.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found!' });
    }

    res.status(200).json(updateTask[0])
  } catch (error) {
    console.log('Error in updateTaskText function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// ============================================
// ИЗТРИВА ЗАДАЧА (САМО АКО Е НА ТЕКУЩИЯ ПОТРЕБИТЕЛ)
// ============================================
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.user.id;
    const deletedTask = await sql`
    DELETE FROM todos
    WHERE id=${id} AND user_id = ${userId}
    RETURNING *
    `;
    if (deletedTask.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found!' });
    }

    res.status(200).json(deletedTask[0]);

  } catch (error) {
    console.log('Error in deleteTask function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};