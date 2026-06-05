-- Pro subscription and activation codes for LearnFlow
-- Run this against the learnflow database

-- Add Pro subscription fields to users table
ALTER TABLE `users`
  ADD COLUMN `is_pro` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否为Pro会员',
  ADD COLUMN `pro_activated_at` timestamp NULL DEFAULT NULL COMMENT 'Pro激活时间',
  ADD COLUMN `pro_expires_at` timestamp NULL DEFAULT NULL COMMENT 'Pro过期时间(永久会员为NULL)';

-- Activation codes table
CREATE TABLE IF NOT EXISTS `activation_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(16) NOT NULL COMMENT '激活码',
  `plan_id` varchar(20) NOT NULL COMMENT '套餐: monthly/yearly/lifetime',
  `created_by` varchar(50) DEFAULT NULL COMMENT '创建者备注',
  `status` enum('unused','used') NOT NULL DEFAULT 'unused',
  `used_by` int DEFAULT NULL COMMENT '使用的用户ID',
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_status` (`status`),
  CONSTRAINT `activation_codes_ibfk_1` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
