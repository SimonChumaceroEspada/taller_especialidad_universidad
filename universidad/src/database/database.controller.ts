import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('database')
@UseGuards(JwtAuthGuard)
export class DatabaseController {
  constructor(private databaseService: DatabaseService) {}

  @Get('tables')
  async getTables() {
    return await this.databaseService.getAllTables();
  }

  @Get('tables/:name')
  async getTableData(@Param('name') tableName: string) {
    return await this.databaseService.getTableData(tableName);
  }
} 