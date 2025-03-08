
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Universidades } from '../entities/universidades.entity';
import { UniversidadesService } from '../services/universidades.service';
import { UniversidadesController } from '../controllers/universidades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Universidades])],
  providers: [UniversidadesService],
  controllers: [UniversidadesController],
})
export class UniversidadesModule {}
    