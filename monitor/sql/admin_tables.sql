-- 监控后台系统 — 新增表
-- 在 learnflow 数据库中执行

USE learnflow;

-- ==================== 管理员账号 ====================
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '登录用户名',
  `password_hash` varchar(255) NOT NULL COMMENT 'bcrypt密码',
  `role` enum('super','editor','viewer') NOT NULL DEFAULT 'viewer' COMMENT '角色',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=启用 0=禁用',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='后台管理员账号';

-- 默认管理员：admin / admin123（bcrypt hash）
INSERT IGNORE INTO `admin_users` (`username`, `password_hash`, `role`) 
VALUES ('admin', '$2b$10$rQJ5z8G4V6Z3M2xLqW0uOuOjKfHt7eUyPbDc9mN1vA8sR4xY0z', 'super');

-- ==================== 操作日志 ====================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL COMMENT '操作者ID',
  `username` varchar(50) DEFAULT NULL COMMENT '操作者用户名',
  `action` varchar(50) NOT NULL COMMENT '操作类型：login/logout/create/update/delete/ban/unban',
  `target` varchar(100) DEFAULT NULL COMMENT '操作对象（表名或用户ID）',
  `detail` text COMMENT '操作详情JSON',
  `ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='后台操作日志';

-- ==================== 番茄钟配置 ====================
CREATE TABLE IF NOT EXISTS `config_tomato` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_minutes` int NOT NULL DEFAULT 25 COMMENT '专注时长（分钟）',
  `short_break` int NOT NULL DEFAULT 5 COMMENT '短休息（分钟）',
  `long_break` int NOT NULL DEFAULT 15 COMMENT '长休息（分钟）',
  `long_break_after` int NOT NULL DEFAULT 4 COMMENT '几轮后长休息',
  `auto_start_break` tinyint(1) DEFAULT 1,
  `auto_start_work` tinyint(1) DEFAULT 0,
  `sound_enabled` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='番茄钟规则配置';

-- 默认配置
INSERT IGNORE INTO `config_tomato` (`id`) VALUES (1);

-- ==================== AI 对话配置 ====================
CREATE TABLE IF NOT EXISTS `config_ai` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(20) NOT NULL DEFAULT 'volcano' COMMENT 'LLM提供商',
  `model` varchar(100) NOT NULL DEFAULT 'ep-20260222221151-l7tjk',
  `temperature` decimal(3,2) DEFAULT 0.7,
  `max_tokens` int DEFAULT 2048,
  `system_prompt` text COMMENT '怪兽系统提示词模板',
  `monster_personalities` json DEFAULT NULL COMMENT '各性格参数',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI对话参数配置';

INSERT IGNORE INTO `config_ai` (`id`) VALUES (1);

-- ==================== 游戏化配置 ====================
CREATE TABLE IF NOT EXISTS `config_game` (
  `id` int NOT NULL AUTO_INCREMENT,
  `base_stamina` int NOT NULL DEFAULT 100 COMMENT '基础体力值',
  `stamina_recover_rate` int NOT NULL DEFAULT 10 COMMENT '每小时恢复体力',
  `base_energy` decimal(10,1) NOT NULL DEFAULT 50.0 COMMENT '基础能量值',
  `energy_recover_rate` decimal(10,1) NOT NULL DEFAULT 5.0 COMMENT '每小时恢复能量',
  `exp_per_completion` int NOT NULL DEFAULT 10 COMMENT '每次完成节点经验',
  `level_up_base` int NOT NULL DEFAULT 100 COMMENT '升级基础经验',
  `level_up_multiplier` decimal(5,2) NOT NULL DEFAULT 1.5 COMMENT '升级经验倍率',
  `free_jumps_per_day` int NOT NULL DEFAULT 10,
  `free_energy_per_day` int NOT NULL DEFAULT 50,
  `free_stamina_per_day` int NOT NULL DEFAULT 100,
  `games_per_day` int NOT NULL DEFAULT 3,
  `pro_free_jumps` int NOT NULL DEFAULT 9999,
  `pro_energy_per_day` int NOT NULL DEFAULT 500,
  `pro_stamina_per_day` int NOT NULL DEFAULT 9999,
  `pro_games_per_day` int NOT NULL DEFAULT 10,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='游戏化养成配置';

INSERT IGNORE INTO `config_game` (`id`) VALUES (1);

-- ==================== 消息推送日志 ====================
CREATE TABLE IF NOT EXISTS `push_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT '目标用户（NULL=全员推送）',
  `title` varchar(200) NOT NULL COMMENT '推送标题',
  `body` text COMMENT '推送内容',
  `type` enum('system','reminder','promo','game') DEFAULT 'system',
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `error_msg` text COMMENT '失败原因',
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='消息推送日志';
