-- LearnFlow 数据库表结构
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wechat_openid VARCHAR(100) UNIQUE,
    wechat_unionid VARCHAR(100) UNIQUE,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    onboarding_completed BOOLEAN DEFAULT FALSE COMMENT '是否完成新手引导',
    last_login_at TIMESTAMP NULL,
    login_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_wechat_openid (wechat_openid)
);

-- 设备会话表
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
    UNIQUE KEY unique_user_device (user_id, device_id),
    INDEX idx_user_device (user_id, device_id),
    INDEX idx_expires (expires_at)
);

-- 技能树表
CREATE TABLE IF NOT EXISTS skill_trees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    domain VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    nodes JSON NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    progress INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_domain (domain)
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_tree_id INT NOT NULL,
    node_id VARCHAR(100) NOT NULL,
    node_name VARCHAR(200) NOT NULL,
    time_spent INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_tree_id) REFERENCES skill_trees(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_skill_tree_id (skill_tree_id),
    INDEX idx_node_id (node_id)
);

-- 热门领域表
CREATE TABLE IF NOT EXISTS popular_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(100) UNIQUE NOT NULL,
    search_count INT DEFAULT 0,
    generated_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domain (domain)
);

-- 怪兽表
CREATE TABLE IF NOT EXISTS monsters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT '小怪兽' COMMENT '怪兽名称',
    style VARCHAR(50) NOT NULL DEFAULT 'default' COMMENT '怪兽外观风格',
    personality ENUM('lively', 'calm', 'rebel') NOT NULL DEFAULT 'calm' COMMENT '怪兽性格类型',
    personality_params JSON COMMENT '性格参数权重',
    level INT NOT NULL DEFAULT 1 COMMENT '等级',
    exp INT NOT NULL DEFAULT 0 COMMENT '经验值',
    stamina INT NOT NULL DEFAULT 100 COMMENT '当前体力值',
    max_stamina INT NOT NULL DEFAULT 100 COMMENT '体力上限',
    energy INT NOT NULL DEFAULT 50 COMMENT '当前Π能量',
    max_energy INT NOT NULL DEFAULT 50 COMMENT 'Π能量上限',
    last_energy_recover TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上次能量恢复时间',
    last_stamina_recover TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上次体力恢复时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_monster_user (user_id),
    INDEX idx_monster_user_id (user_id),
    INDEX idx_monster_personality (personality)
);

-- 怪兽消息表
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
