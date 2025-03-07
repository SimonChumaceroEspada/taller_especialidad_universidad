
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';

@Injectable()
export class Tipos_ambientesService {
  constructor(
    @InjectRepository(Tipos_ambientes)
    private readonly tipos_ambientesRepository: Repository<Tipos_ambientes>,
  ) {}

  findAll(): Promise<Tipos_ambientes[]> {
    return this.tipos_ambientesRepository.find();
  }

  create(createDto: Tipos_ambientes): Promise<Tipos_ambientes> {
    const entity = this.tipos_ambientesRepository.create(createDto);
    return this.tipos_ambientesRepository.save(entity);
  }

  update(id: string, updateDto: Tipos_ambientes): Promise<Tipos_ambientes> {
    return this.tipos_ambientesRepository.save({ ...updateDto, id: Number(id) });
  }
}
    