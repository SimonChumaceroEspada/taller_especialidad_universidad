
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UniversidadesService } from '../services/universidades.service';
import { Universidades } from '../entities/universidades.entity';

@Controller('universidades')
export class UniversidadesController {
  constructor(private readonly universidadesService: UniversidadesService) {}

  @Get()
  findAll() {
    return this.universidadesService.findAll();
  }

  @Post()
  create(@Body() createDto: Universidades) {
    return this.universidadesService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: Universidades) {
    return this.universidadesService.update(id, updateDto);
  }
}
    