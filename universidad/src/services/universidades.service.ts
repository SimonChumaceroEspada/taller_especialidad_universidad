
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Universidades } from '../entities/universidades.entity';

@Injectable()
export class UniversidadesService {
  constructor(
    @InjectRepository(Universidades)
    private readonly universidadesRepository: Repository<Universidades>,
  ) {}

  findAll(): Promise<Universidades[]> {
    return this.universidadesRepository.find();
  }

  create(createDto: Universidades): Promise<Universidades> {
    const entity = this.universidadesRepository.create(createDto);
    return this.universidadesRepository.save(entity);
  }

  update(id: string, updateDto: Universidades): Promise<Universidades> {
    return this.universidadesRepository.save({ ...updateDto, id: Number(id) });
  }
}
    