import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Body, Post } from '@nestjs/common';


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

  @Post('crud-operations')
  async handleCrudOperations(@Body() body: { tables: string[] }) {
    return await this.databaseService.createCrudOperations(body.tables);
  }
}