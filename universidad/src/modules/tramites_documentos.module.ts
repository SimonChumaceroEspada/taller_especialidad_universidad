
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tramites_documentos } from '../entities/tramites_documentos.entity';
import { Tramites_documentosService } from '../services/tramites_documentos.service';
import { Tramites_documentosController } from '../controllers/tramites_documentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tramites_documentos])],
  providers: [Tramites_documentosService],
  controllers: [Tramites_documentosController],
})
export class Tramites_documentosModule {}
    