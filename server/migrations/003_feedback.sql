-- Feedback table for LearnFlow
-- Run this against the learnflow database
-- This migration only adds a new table, does NOT affect existing data

CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '提交反馈的用户ID',
  `category` varchar(50) NOT NULL DEFAULT 'other' COMMENT '反馈分类: stamina/resource/game/monster/task/pomodoro/other',
  `content` text NOT NULL COMMENT '反馈内容',
  `status` enum('pending','processing','resolved','closed') NOT NULL DEFAULT 'pending' COMMENT '处理状态',
  `admin_reply` text DEFAULT NULL COMMENT '管理员回复',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户反馈表';
