
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sexos } from '../entities/sexos.entity';

@Injectable()
export class SexosService {
  constructor(
    @InjectRepository(Sexos)
    private readonly sexosRepository: Repository<Sexos>,
  ) {}

  findAll(): Promise<Sexos[]> {
    return this.sexosRepository.find();
  }

  create(createDto: Sexos): Promise<Sexos> {
    const entity = this.sexosRepository.create(createDto);
    return this.sexosRepository.save(entity);
  }

  update(id: string, updateDto: Sexos): Promise<Sexos> {
    return this.sexosRepository.save({ ...updateDto, id: Number(id) });
  }
}
    