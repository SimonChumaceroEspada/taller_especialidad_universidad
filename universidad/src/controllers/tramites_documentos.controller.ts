
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { Tramites_documentosService } from '../services/tramites_documentos.service';
import { Tramites_documentos } from '../entities/tramites_documentos.entity';

@Controller('tramites_documentos')
export class Tramites_documentosController {
  constructor(private readonly tramites_documentosService: Tramites_documentosService) {}

  @Get()
  findAll() {
    return this.tramites_documentosService.findAll();
  }

  @Post()
  create(@Body() createDto: Tramites_documentos) {
    return this.tramites_documentosService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: Tramites_documentos) {
    return this.tramites_documentosService.update(id, updateDto);
  }
}
    