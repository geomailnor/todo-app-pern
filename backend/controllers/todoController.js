import { sql } from "../config/db.js";

// CRUD Operations

export const getTasks = async (rew, res) => {
  try {
    const tasks = await sql`
    SELECT * FROM todos
    ORDER BY created_at DESC
    `;
    // console.log('feched products', tasks);
    res.status(200).json({ tasks });
  } catch (error) {
    console.log('Error in getTasks function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const createTask = async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ success: false, message: 'Task field are required!' });
  }
  try {
    const newTask = await sql`
    INSERT INTO todos (task, completed)
    VALUES (${task}, false)
    RETURNING *
    `;
    // console.log('New task added', newTask);
    res.status(201).json(newTask[0]);

  } catch (error) {
    console.log('Error in createTask function', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const getTask = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid task id (Not a number)' });
  }
  try {
    const task = await sql`
    SELECT * FROM todos WHERE id=${id}
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
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Status must be "true" or "false"' });
  }
  try {
    const updateTask = await sql`
    UPDATE todos
    SET completed=${completed}
    WHERE id=${id}
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

export const updateTaskText = async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  if (!task || !task.trim()) {
    return res.status(400).json({ success: false, message: 'Task text is required!' });
  }
  try {
    const updateTask = await sql`
    UPDATE todos
    SET task = ${task}
    WHERE id = ${id}
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

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await sql`
    DELETE FROM todos
    WHERE id=${id}
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