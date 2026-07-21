import express from 'express';
import { FeedbackController } from '../controllers/feedbackController';

const router = express.Router();

router.post('/submit', FeedbackController.submitFeedback);
router.get('/list', FeedbackController.getUserFeedbacks);

export default router;
