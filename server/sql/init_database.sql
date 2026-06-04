-- ================================================================
-- LearnFlow (学了么) 数据库初始化脚本
-- 版本: 2.0 (精简版)
-- 说明: 仅保留 AI 对话 + AI 一键填充 + 核心业务所需的表
-- ================================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS learnflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE learnflow;

-- ================================================================
-- 1. 用户表（支持微信/邮箱双登录）
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    wechat_openid VARCHAR(100) UNIQUE COMMENT '微信OpenID',
    wechat_unionid VARCHAR(100) UNIQUE COMMENT '微信UnionID',
    password_hash VARCHAR(255) COMMENT '密码哈希（邮箱登录用）',
    nickname VARCHAR(100) COMMENT '用户昵称',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    identity VARCHAR(20) DEFAULT NULL COMMENT '用户身份：student(学生) / worker(上班族)',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    login_count INT DEFAULT 0 COMMENT '登录次数',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    onboarding_completed BOOLEAN DEFAULT FALSE COMMENT '是否完成新手引导',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_wechat_openid (wechat_openid),
    INDEX idx_status (status)
);

-- ================================================================
-- 2. 怪兽表（每用户唯一一只怪兽）
-- ================================================================
CREATE TABLE IF NOT EXISTS monsters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT '小怪兽' COMMENT '怪兽名称',
    style VARCHAR(50) NOT NULL DEFAULT 'default' COMMENT '怪兽外观风格',
    personality ENUM('lively', 'calm', 'rebel') NOT NULL DEFAULT 'calm' COMMENT '怪兽性格：活力/沉稳/叛逆',
    personality_params JSON COMMENT '性格参数权重',
    level INT NOT NULL DEFAULT 1 COMMENT '等级',
    exp INT NOT NULL DEFAULT 0 COMMENT '经验值',
    stamina INT NOT NULL DEFAULT 100 COMMENT '当前体力值',
    max_stamina INT NOT NULL DEFAULT 100 COMMENT '体力上限',
    energy INT NOT NULL DEFAULT 50 COMMENT '当前Π能量',
    max_energy INT NOT NULL DEFAULT 50 COMMENT 'Π能量上限',
    last_energy_recover TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上次Π能量恢复时间',
    last_stamina_recover TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上次体力恢复时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_monster_user (user_id),
    INDEX idx_monster_personality (personality)
);

-- ================================================================
-- 3. 怪兽消息表（AI 对话记录）
-- ================================================================
CREATE TABLE IF NOT EXISTS monster_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL COMMENT '消息内容',
    is_user BOOLEAN NOT NULL COMMENT '是否为用户发送',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_monster_message_user_id (user_id),
    INDEX idx_monster_message_created_at (created_at)
);

-- ================================================================
-- 4. 学习领域表（自定义领域 + AI 一键填充内容存储）
-- ================================================================
CREATE TABLE IF NOT EXISTS domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL COMMENT '领域名称',
    type ENUM('preset', 'custom') DEFAULT 'custom' COMMENT '类型：预设/自定义',
    mind_map_data JSON COMMENT '技能树节点数据（AI 填充生成）',
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '学习进度百分比',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ================================================================
-- 5. 节点进度表（领域下各节点的学习状态）
-- ================================================================
CREATE TABLE IF NOT EXISTS node_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    domain_id INT NOT NULL,
    node_id VARCHAR(100) NOT NULL COMMENT '节点ID',
    status ENUM('pending', 'doing', 'done') DEFAULT 'pending' COMMENT '状态：未解锁/进行中/已完成',
    study_time INT DEFAULT 0 COMMENT '学习时长（分钟）',
    notes TEXT COMMENT '节点笔记',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    INDEX idx_user_domain (user_id, domain_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_user_node (user_id, domain_id, node_id)
);

-- ================================================================
-- 6. 学习记录表（开始/结束学习的详细记录）
-- ================================================================
CREATE TABLE IF NOT EXISTS study_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    domain_id INT NOT NULL,
    node_id VARCHAR(100) NOT NULL COMMENT '节点ID',
    start_time TIMESTAMP NULL COMMENT '开始时间',
    end_time TIMESTAMP NULL COMMENT '结束时间',
    duration INT DEFAULT 0 COMMENT '学习时长（分钟）',
    progress_before DECIMAL(5,2) DEFAULT 0.00 COMMENT '学习前进度',
    progress_after DECIMAL(5,2) DEFAULT 0.00 COMMENT '学习后进度',
    reward_obtained JSON COMMENT '获得的奖励',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    INDEX idx_user_domain (user_id, domain_id),
    INDEX idx_created_at (created_at)
);

-- ================================================================
-- 7. 笔记表
-- ================================================================
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL COMMENT '笔记日期',
    content TEXT COMMENT '笔记内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
);

-- ================================================================
-- 8. 奖励表
-- ================================================================
CREATE TABLE IF NOT EXISTS rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('stamina', 'energy') NOT NULL COMMENT '奖励类型：体力/Π能量',
    amount INT DEFAULT 0 COMMENT '奖励数量',
    source VARCHAR(200) COMMENT '奖励来源',
    claimed BOOLEAN DEFAULT FALSE COMMENT '是否已领取',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_claimed (claimed)
);

-- ================================================================
-- 测试数据
-- ================================================================
INSERT IGNORE INTO users (username, email, password_hash, nickname) VALUES
('testuser', 'test@learnflow.com', '$2b$10$examplehashedpassword', '测试用户');
