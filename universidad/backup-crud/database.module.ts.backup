import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';
import { Tipos_ambientesService } from '../services/tipos_ambientes.service';
import { Tipos_ambientesController } from '../controllers/tipos_ambientes.controller';



@Module({
  imports: [
    TypeOrmModule.forFeature([Tipos_ambientes,
])],
  providers: [
    DatabaseService, Tipos_ambientesService, Tipos_ambientesController,
],
  controllers: [DatabaseController],
  exports: [DatabaseService],
})
export class DatabaseModule {}