import express from 'express';
import { createTask, deleteTask, getTask, getTasks, updateTask, updateTaskText } from '../controllers/todoController.js';


import { authenticate } from '../middleware/auth.js';
const router = express.Router();

// ВСИЧКИ routes изискват автентикация
router.get('/', authenticate, getTasks);
router.post('/', authenticate, createTask);
router.get('/:id', authenticate, getTask);
router.put('/:id', authenticate, updateTask);
router.patch('/:id/text', authenticate, updateTaskText);
router.delete('/:id', authenticate, deleteTask);

export default router;