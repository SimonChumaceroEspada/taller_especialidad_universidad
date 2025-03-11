import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
// import { DatabaseGateway } from './database.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';
import { Tipos_ambientesService } from '../services/tipos_ambientes.service';
import { Tipos_ambientesController } from '../controllers/tipos_ambientes.controller';
import { LogTable } from '../entities/log_table.entity';
import { EncryptedLogTable } from '../entities/encrypted_log_table.entity';
import { LogTableService } from '../services/log_table.service';
import { EncryptedLogTableService } from '../services/encrypted_log_table.service';
import { LogTableController } from '../controllers/log_table.controller';
import { EncryptedLogTableController } from '../controllers/encrypted_log_table.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tipos_ambientes,
      LogTable,
      EncryptedLogTable,
    ]),
  ],
  providers: [
    DatabaseService, 
    Tipos_ambientesService, 
    Tipos_ambientesController,
    LogTableService,
    EncryptedLogTableService,
  ],
  controllers: [
    DatabaseController,
    LogTableController,
    EncryptedLogTableController,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}