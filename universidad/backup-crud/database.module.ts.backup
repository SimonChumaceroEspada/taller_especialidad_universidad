import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';
import { Tipos_ambientesService } from '../services/tipos_ambientes.service';
import { Tipos_ambientesController } from '../controllers/tipos_ambientes.controller';
import { Tramites_documentos } from '../entities/tramites_documentos.entity';
import { Tramites_documentosService } from '../services/tramites_documentos.service';
import { Tramites_documentosController } from '../controllers/tramites_documentos.controller';
import { Sexos } from '../entities/sexos.entity';
import { SexosService } from '../services/sexos.service';
import { SexosController } from '../controllers/sexos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tipos_ambientes, Tramites_documentos, Sexos,
])],
  providers: [
    DatabaseService, Tipos_ambientesService, Tipos_ambientesController, Tramites_documentosService, Tramites_documentosController, SexosService, SexosController,
],
  controllers: [DatabaseController],
  exports: [DatabaseService],
})
export class DatabaseModule {}