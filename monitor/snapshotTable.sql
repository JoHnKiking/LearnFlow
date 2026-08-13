-- 监控快照表（独立于主服务，5分钟粒度）
-- 在 learnflow 数据库中执行：mysql -u root -p < snapshotTable.sql

USE learnflow;

CREATE TABLE IF NOT EXISTS `monitor_snapshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `snapshot_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '快照时间',
  `total_users` int NOT NULL DEFAULT 0 COMMENT '总用户数（active）',
  `dau` int NOT NULL DEFAULT 0 COMMENT '当日DAU',
  `new_users_today` int NOT NULL DEFAULT 0 COMMENT '当日新注册',
  `node_completions_today` int NOT NULL DEFAULT 0 COMMENT '当日节点完成数（累计）',
  `study_minutes_today` int NOT NULL DEFAULT 0 COMMENT '当日学习分钟（累计）',
  `pro_users` int NOT NULL DEFAULT 0 COMMENT 'Pro用户总数',
  `monster_messages_today` int NOT NULL DEFAULT 0 COMMENT '当日怪兽对话数（累计）',
  `notes_created_today` int NOT NULL DEFAULT 0 COMMENT '当日笔记创建数（累计）',
  `module_creations_today` int NOT NULL DEFAULT 0 COMMENT '当日模块创建数（累计）',
  `active_users_7d` int NOT NULL DEFAULT 0 COMMENT '近7天活跃用户数',
  `total_domains` int NOT NULL DEFAULT 0 COMMENT '总领域数',
  `total_skill_trees` int NOT NULL DEFAULT 0 COMMENT '总模块数',
  PRIMARY KEY (`id`),
  KEY `idx_snapshot_at` (`snapshot_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='监控指标快照';
