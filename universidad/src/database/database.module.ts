import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';
import { Universidades } from '../entities/universidades.entity';
import { UniversidadesService } from '../services/universidades.service';
import { UniversidadesController } from '../controllers/universidades.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tipos_ambientes, Universidades,
])],
  providers: [
    DatabaseService, UniversidadesService, UniversidadesController,
],
  controllers: [DatabaseController],
  exports: [DatabaseService],
})
export class DatabaseModule {}