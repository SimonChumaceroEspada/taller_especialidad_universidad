
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { Tipos_ambientesService } from '../services/tipos_ambientes.service';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';

@Controller('tipos_ambientes')
export class Tipos_ambientesController {
  constructor(private readonly tipos_ambientesService: Tipos_ambientesService) {}

  @Get()
  findAll() {
    return this.tipos_ambientesService.findAll();
  }

  @Post()
  create(@Body() createDto: Tipos_ambientes) {
    return this.tipos_ambientesService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: Tipos_ambientes) {
    return this.tipos_ambientesService.update(id, updateDto);
  }
}
    