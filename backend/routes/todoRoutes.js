// backend/routes/todoRoutes.js
import express from 'express';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskText,
  deleteTask
} from '../controllers/todoController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getTasks);
router.post('/', authenticate, createTask);
router.get('/:id', authenticate, getTask);
router.put('/:id', authenticate, updateTask);
router.put('/text/:id', authenticate, updateTaskText);
router.delete('/:id', authenticate, deleteTask);

export default router;