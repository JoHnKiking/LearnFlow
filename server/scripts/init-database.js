#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  console.log('🚀 开始初始化LearnFlow数据库...');
  
  // 数据库配置
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };
  
  try {
    // 连接数据库（不指定数据库名）
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, '../sql/init_database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 执行SQL脚本
    console.log('📝 执行数据库初始化脚本...');
    await connection.execute(sqlScript);
    
    console.log('✅ 数据库初始化完成！');
    console.log('📊 已创建以下表：');
    console.log('   - users (用户表)');
    console.log('   - skill_trees (技能树表)');
    console.log('   - learning_records (学习记录表)');
    console.log('   - popular_domains (热门领域表)');
    
    // 关闭连接
    await connection.end();
    console.log('🔌 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行初始化
initializeDatabase();