import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogTableService } from '../services/log_table.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogTableController {
  constructor(private readonly logTableService: LogTableService) {}

  @Get()
  async findAll(@Query('limit') limit: number) {
    const logs = await this.logTableService.findAll(limit);
    // Asegurar que todos los valores sean serializables
    return logs.map(log => ({
      id: log.id,
      table_name: log.table_name ? String(log.table_name) : '',
      id_registro_tabla_modificada: log.id_registro_tabla_modificada ? String(log.id_registro_tabla_modificada) : '',
      action: log.action ? String(log.action) : '',
      date: log.date ? log.date.toISOString() : '',
    }));
  }

  @Get('latest')
  async findLatest(
    @Query('lastId') lastId: number,
    @Query('limit') limit: number,
  ) {
    const logs = await this.logTableService.findLatest(lastId, limit);
    // Asegurar que todos los valores sean serializables
    return logs.map(log => ({
      id: log.id,
      table_name: log.table_name ? String(log.table_name) : '',
      id_registro_tabla_modificada: log.id_registro_tabla_modificada ? String(log.id_registro_tabla_modificada) : '',
      action: log.action ? String(log.action) : '',
      date: log.date ? log.date.toISOString() : '',
    }));
  }

  @Get('by-table')
  async findByTable(
    @Query('tableName') tableName: string,
    @Query('limit') limit: number,
  ) {
    const logs = await this.logTableService.findByTable(tableName, limit);
    // Asegurar que todos los valores sean serializables
    return logs.map(log => ({
      id: log.id,
      table_name: log.table_name ? String(log.table_name) : '',
      id_registro_tabla_modificada: log.id_registro_tabla_modificada ? String(log.id_registro_tabla_modificada) : '',
      action: log.action ? String(log.action) : '',
      date: log.date ? log.date.toISOString() : '',
    }));
  }
}
