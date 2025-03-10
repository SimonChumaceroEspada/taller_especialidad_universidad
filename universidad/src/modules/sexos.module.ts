
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sexos } from '../entities/sexos.entity';
import { SexosService } from '../services/sexos.service';
import { SexosController } from '../controllers/sexos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sexos])],
  providers: [SexosService],
  controllers: [SexosController],
})
export class SexosModule {}
    