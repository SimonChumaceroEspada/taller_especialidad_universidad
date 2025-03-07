
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';
import { Tipos_ambientesService } from '../services/tipos_ambientes.service';
import { Tipos_ambientesController } from '../controllers/tipos_ambientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tipos_ambientes])],
  providers: [Tipos_ambientesService],
  controllers: [Tipos_ambientesController],
})
export class Tipos_ambientesModule {}
    