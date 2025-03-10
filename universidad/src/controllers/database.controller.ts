import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('restart')
  async restartApplication() {
    return this.databaseService.restartApplication();
  }

  @Put('tables/:tableName/:id')
  async updateRecord(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body() record: any
  ) {
    return this.databaseService.updateRecord(tableName, id, record);
  }
}
