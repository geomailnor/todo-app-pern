import express from 'express';
import { createTask, deleteTask, getTask, getTasks, updateTask, updateTaskText } from '../controllers/todoController.js';

const router = express.Router();

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/text/:id', updateTaskText);
router.delete('/:id', deleteTask);

export default router;