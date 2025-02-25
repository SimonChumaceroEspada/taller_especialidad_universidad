import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async getAllTables(): Promise<string[]> {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC
    `;
    
    const tables = await this.entityManager.query(query);
    return tables.map(table => table.table_name);
  }

  async getTableData(tableName: string) {
    const query = `SELECT * FROM "${tableName}" LIMIT 100`;
    return await this.entityManager.query(query);
  }
} 