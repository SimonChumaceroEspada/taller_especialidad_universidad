import { Controller, Get, Param, UseGuards, Body, Post, Put, Delete } from '@nestjs/common';
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

  @Post('crud-operations')
  async handleCrudOperations(@Body() body: { tables: string[] }) {
    console.log("llegue al crud operations");
    return await this.databaseService.createCrudOperations(body.tables);
  }

  @Post('tables/:name')
  async createRecord(@Param('name') tableName: string, @Body() record: any) {
    return await this.databaseService.createRecord(tableName, record);
  }

  @Put('tables/:name/:id')
  async updateRecord(@Param('name') tableName: string, @Param('id') id: string, @Body() record: any) {
    return await this.databaseService.updateRecord(tableName, id, record);
  }

  @Delete('tables/:name/:id')
  async deleteRecord(@Param('name') tableName: string, @Param('id') id: string) {
    return await this.databaseService.deleteRecord(tableName, id);
  }

  @Post('restart')
  async restartApplication() {
    return this.databaseService.restartApplication();
  }
}