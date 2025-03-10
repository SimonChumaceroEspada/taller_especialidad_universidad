
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tramites_documentos } from '../entities/tramites_documentos.entity';

@Injectable()
export class Tramites_documentosService {
  constructor(
    @InjectRepository(Tramites_documentos)
    private readonly tramites_documentosRepository: Repository<Tramites_documentos>,
  ) {}

  findAll(): Promise<Tramites_documentos[]> {
    return this.tramites_documentosRepository.find();
  }

  create(createDto: Tramites_documentos): Promise<Tramites_documentos> {
    const entity = this.tramites_documentosRepository.create(createDto);
    return this.tramites_documentosRepository.save(entity);
  }

  update(id: string, updateDto: Tramites_documentos): Promise<Tramites_documentos> {
    return this.tramites_documentosRepository.save({ ...updateDto, id: Number(id) });
  }
}
    