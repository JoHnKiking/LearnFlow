import mysql from 'mysql2/promise';
import { DatabaseConnection } from '../config/database';
import { 
  User, CreateUserRequest, UserResponse,
  SkillTree, CreateSkillTreeRequest, UpdateSkillTreeRequest, SkillTreeListResponse,
  LearningRecord, CreateLearningRecordRequest, UpdateLearningRecordRequest, UserProgress,
  PopularDomain, PopularDomainResponse
} from '../models';

export class DatabaseService {
  
  // ===== 用户相关操作 =====
  
  static async getUserById(id: number): Promise<User | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    const user = (rows as mysql.RowDataPacket[])[0];
    return user ? this.mapUserFromDB(user) : null;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = ?',
      [username]
    );
    const user = (rows as mysql.RowDataPacket[])[0];
    return user ? this.mapUserFromDB(user) : null;
  }

  static async createUser(userData: CreateUserRequest): Promise<number> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [userData.username, userData.email, userData.password]
    );
    return (result as mysql.ResultSetHeader).insertId;
  }

  // ===== 技能树相关操作 =====

  static async createSkillTree(skillTreeData: CreateSkillTreeRequest): Promise<number> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO skill_trees (user_id, domain, title, description, nodes, is_public) VALUES (?, ?, ?, ?, ?, ?)',
      [
        skillTreeData.userId,
        skillTreeData.domain,
        skillTreeData.title,
        skillTreeData.description || null,
        JSON.stringify(skillTreeData.nodes),
        skillTreeData.isPublic || false
      ]
    );
    return (result as mysql.ResultSetHeader).insertId;
  }

  static async getSkillTreeById(id: number): Promise<SkillTree | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM skill_trees WHERE id = ?',
      [id]
    );
    const tree = (rows as mysql.RowDataPacket[])[0];
    return tree ? this.mapSkillTreeFromDB(tree) : null;
  }

  static async getSkillTreesByUserId(userId: number, page: number = 1, limit: number = 10): Promise<SkillTreeListResponse> {
    const connection = await DatabaseConnection.getConnection();
    const offset = (page - 1) * limit;
    
    // 获取总数
    const [countRows] = await connection.execute(
      'SELECT COUNT(*) as total FROM skill_trees WHERE user_id = ?',
      [userId]
    );
    const total = (countRows as mysql.RowDataPacket[])[0].total;
    
    // 获取分页数据
    const [rows] = await connection.execute(
      'SELECT * FROM skill_trees WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    
    const trees = (rows as mysql.RowDataPacket[]).map(row => this.mapSkillTreeFromDB(row));
    
    return {
      trees,
      total,
      page,
      limit
    };
  }

  static async updateSkillTreeProgress(treeId: number, progress: number): Promise<boolean> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'UPDATE skill_trees SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [progress, treeId]
    );
    return (result as mysql.ResultSetHeader).affectedRows > 0;
  }

  // ===== 学习记录相关操作 =====

  static async createLearningRecord(recordData: CreateLearningRecordRequest): Promise<number> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO learning_records (user_id, skill_tree_id, node_id, node_name, time_spent, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [
        recordData.userId,
        recordData.skillTreeId,
        recordData.nodeId,
        recordData.nodeName,
        recordData.timeSpent,
        recordData.notes || null
      ]
    );
    return (result as mysql.ResultSetHeader).insertId;
  }

  static async updateLearningRecord(recordId: number, updateData: UpdateLearningRecordRequest): Promise<boolean> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'UPDATE learning_records SET completed = ?, time_spent = ?, notes = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        updateData.completed || false,
        updateData.timeSpent || 0,
        updateData.notes || null,
        updateData.completedAt || null,
        recordId
      ]
    );
    return (result as mysql.ResultSetHeader).affectedRows > 0;
  }

  static async getUserProgress(userId: number, skillTreeId: number): Promise<UserProgress> {
    const connection = await DatabaseConnection.getConnection();
    
    // 获取技能树总节点数
    const [treeRows] = await connection.execute(
      'SELECT nodes FROM skill_trees WHERE id = ?',
      [skillTreeId]
    );
    const tree = (treeRows as mysql.RowDataPacket[])[0];
    const nodes = tree ? JSON.parse(tree.nodes) : [];
    const totalNodes = this.countAllNodes(nodes);
    
    // 获取已完成节点数
    const [completedRows] = await connection.execute(
      'SELECT COUNT(*) as completed FROM learning_records WHERE user_id = ? AND skill_tree_id = ? AND completed = true',
      [userId, skillTreeId]
    );
    const completedNodes = (completedRows as mysql.RowDataPacket[])[0].completed;
    
    // 获取总学习时长
    const [timeRows] = await connection.execute(
      'SELECT SUM(time_spent) as totalTime FROM learning_records WHERE user_id = ? AND skill_tree_id = ?',
      [userId, skillTreeId]
    );
    const totalTimeSpent = (timeRows as mysql.RowDataPacket[])[0].totalTime || 0;
    
    const overallProgress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;
    
    return {
      userId,
      skillTreeId,
      totalNodes,
      completedNodes,
      totalTimeSpent,
      overallProgress,
      lastUpdated: new Date()
    };
  }

  // ===== 热门领域相关操作 =====

  static async getPopularDomains(limit: number = 10): Promise<PopularDomainResponse[]> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT domain, search_count, generated_count FROM popular_domains ORDER BY (search_count + generated_count) DESC LIMIT ?',
      [limit]
    );
    
    return (rows as mysql.RowDataPacket[]).map(row => ({
      domain: row.domain,
      popularity: row.search_count + row.generated_count,
      searchCount: row.search_count,
      generatedCount: row.generated_count
    }));
  }

  static async incrementDomainSearchCount(domain: string): Promise<void> {
    const connection = await DatabaseConnection.getConnection();
    await connection.execute(
      'INSERT INTO popular_domains (domain, search_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE search_count = search_count + 1',
      [domain]
    );
  }

  static async incrementDomainGeneratedCount(domain: string): Promise<void> {
    const connection = await DatabaseConnection.getConnection();
    await connection.execute(
      'INSERT INTO popular_domains (domain, generated_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE generated_count = generated_count + 1',
      [domain]
    );
  }

  // ===== 辅助方法 =====

  private static mapUserFromDB(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private static mapSkillTreeFromDB(row: any): SkillTree {
    return {
      id: row.id,
      userId: row.user_id,
      domain: row.domain,
      title: row.title,
      description: row.description,
      nodes: JSON.parse(row.nodes),
      progress: parseFloat(row.progress),
      isPublic: Boolean(row.is_public),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private static countAllNodes(nodes: any[]): number {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        count += this.countAllNodes(node.children);
      }
    });
    return count;
  }
}