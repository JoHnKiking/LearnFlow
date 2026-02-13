-- LearnFlow 数据库初始化脚本
-- 创建数据库和表结构

-- 创建数据库
CREATE DATABASE IF NOT EXISTS learnflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE learnflow;

-- 用户表（支持微信/手机号双登录）
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    wechat_openid VARCHAR(100) UNIQUE COMMENT '微信OpenID',
    wechat_unionid VARCHAR(100) UNIQUE COMMENT '微信UnionID',
    password_hash VARCHAR(255) COMMENT '密码哈希（手机号登录用）',
    nickname VARCHAR(100) COMMENT '用户昵称',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    login_count INT DEFAULT 0 COMMENT '登录次数',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_wechat_openid (wechat_openid),
    INDEX idx_wechat_unionid (wechat_unionid),
    INDEX idx_status (status)
);

-- 技能树表
CREATE TABLE IF NOT EXISTS skill_trees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    domain VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    nodes JSON NOT NULL COMMENT '技能树节点数据（JSON格式）',
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '学习进度百分比',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_domain (domain),
    INDEX idx_created_at (created_at)
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_tree_id INT NOT NULL,
    node_id VARCHAR(100) NOT NULL COMMENT '技能节点ID',
    node_name VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    time_spent INT DEFAULT 0 COMMENT '学习时长（分钟）',
    notes TEXT COMMENT '学习笔记',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_tree_id) REFERENCES skill_trees(id) ON DELETE CASCADE,
    INDEX idx_user_skill (user_id, skill_tree_id),
    INDEX idx_completed (completed),
    UNIQUE KEY unique_user_node (user_id, skill_tree_id, node_id)
);

-- 热门领域统计表
CREATE TABLE IF NOT EXISTS popular_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(100) UNIQUE NOT NULL,
    search_count INT DEFAULT 0,
    generated_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_popularity (search_count, generated_count)
);

-- 设备登录记录表（用于记住登录状态）
CREATE TABLE IF NOT EXISTS device_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(100) NOT NULL COMMENT '设备唯一标识',
    device_type ENUM('ios', 'android', 'web') NOT NULL COMMENT '设备类型',
    device_name VARCHAR(100) COMMENT '设备名称',
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后活跃时间',
    expires_at TIMESTAMP NOT NULL COMMENT '会话过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_device (user_id, device_id),
    INDEX idx_expires (expires_at)
);

-- 插入初始热门领域数据
INSERT IGNORE INTO popular_domains (domain, search_count, generated_count) VALUES
('前端开发', 100, 85),
('后端开发', 95, 78),
('移动开发', 80, 65),
('数据科学', 75, 60),
('人工智能', 90, 72),
('网络安全', 60, 45),
('云计算', 70, 55),
('区块链', 50, 35);

-- 创建测试用户（支持多种登录方式）
INSERT IGNORE INTO users (username, email, phone, password_hash, nickname) VALUES
('testuser', 'test@learnflow.com', '13800138000', '$2b$10$examplehashedpassword', '测试用户');

-- 查看表结构
SHOW TABLES;

-- 显示各表的列信息
DESCRIBE users;
DESCRIBE skill_trees;
DESCRIBE learning_records;
DESCRIBE popular_domains;