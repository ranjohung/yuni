/**
 * 数据库配置与连接
 */
const mysql = require('mysql2/promise');

let pool = null;

function getConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yu_ni',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  };
}

async function initDatabase() {
  const config = getConfig();
  
  // 先创建数据库（如果不存在）
  const tempConn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password
  });
  await tempConn.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await tempConn.end();
  
  pool = mysql.createPool(config);
  
  // 初始化表结构
  await initTables();
  
  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }
  return pool;
}

async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function execute(sql, params = []) {
  const p = getPool();
  const [result] = await p.execute(sql, params);
  return result;
}

async function initTables() {
  const sql = `
    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      phone VARCHAR(20) UNIQUE NOT NULL,
      nickname VARCHAR(50) DEFAULT '',
      avatar_url VARCHAR(500) DEFAULT '',
      real_name_verified BOOLEAN DEFAULT FALSE,
      real_name VARCHAR(50) DEFAULT '',
      id_card_hash VARCHAR(128) DEFAULT '',
      birth_date DATE NULL,
      membership_level INT DEFAULT 0,
      membership_expire DATETIME NULL,
      daily_usage_minutes INT DEFAULT 0,
      last_usage_date DATE NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 伴侣角色表
    CREATE TABLE IF NOT EXISTS partners (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      name VARCHAR(50) NOT NULL,
      core_type ENUM('pursuer','guardian','wanderer','healer') NOT NULL,
      personality_traits JSON,
      relationship_type VARCHAR(100) DEFAULT '',
      nickname_for_user VARCHAR(50) DEFAULT '',
      background_story TEXT,
      voice_style VARCHAR(50) DEFAULT '',
      affinity_score INT DEFAULT 0,
      affinity_level INT DEFAULT 1,
      status ENUM('active','crisis','ended') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_default BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 记忆表
    CREATE TABLE IF NOT EXISTS memories (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      partner_id BIGINT NOT NULL,
      memory_type ENUM('fact','emotion','relationship') NOT NULL,
      content TEXT NOT NULL,
      importance INT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 训练记录表
    CREATE TABLE IF NOT EXISTS training_records (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      partner_id BIGINT NOT NULL,
      scenario_id INT NOT NULL,
      total_score INT DEFAULT 0,
      communication_score INT DEFAULT 0,
      expression_score INT DEFAULT 0,
      empathy_score INT DEFAULT 0,
      emotion_control_score INT DEFAULT 0,
      adaptability_score INT DEFAULT 0,
      choices_data JSON,
      is_completed BOOLEAN DEFAULT FALSE,
      duration_seconds INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 学习卡片表
    CREATE TABLE IF NOT EXISTS study_cards (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      scenario_id INT NOT NULL,
      original_choice VARCHAR(500) DEFAULT '',
      error_analysis TEXT,
      correct_approach TEXT,
      template_text TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      shared_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 才艺库表
    CREATE TABLE IF NOT EXISTS talents (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      talent_type ENUM('story','joke','poem','song') NOT NULL,
      content TEXT NOT NULL,
      personality_tag VARCHAR(50) DEFAULT '',
      is_llm_generated BOOLEAN DEFAULT FALSE,
      usage_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 对话历史表
    CREATE TABLE IF NOT EXISTS chat_history (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      partner_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      role ENUM('user','assistant') NOT NULL,
      content TEXT NOT NULL,
      affinity_change INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 每日使用统计表
    CREATE TABLE IF NOT EXISTS daily_stats (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      stat_date DATE NOT NULL,
      usage_minutes INT DEFAULT 0,
      training_count INT DEFAULT 0,
      chat_count INT DEFAULT 0,
      tickets_earned INT DEFAULT 0,
      tickets_used INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_user_date (user_id, stat_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 用户穿梭券表
    CREATE TABLE IF NOT EXISTS user_tickets (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      balance INT DEFAULT 3,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      await pool.execute(stmt);
    } catch (err) {
      // 跳过已存在的表错误
      if (err.errno !== 1050) {
        console.warn('[DB] 建表警告:', err.message);
      }
    }
  }
  
  console.log('[DB] 数据库表初始化完成');
}

module.exports = { initDatabase, getPool, query, queryOne, execute };
