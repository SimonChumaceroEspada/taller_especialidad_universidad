
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SexosService } from '../services/sexos.service';
import { Sexos } from '../entities/sexos.entity';

@Controller('sexos')
export class SexosController {
  constructor(private readonly sexosService: SexosService) {}

  @Get()
  findAll() {
    return this.sexosService.findAll();
  }

  @Post()
  create(@Body() createDto: Sexos) {
    return this.sexosService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: Sexos) {
    return this.sexosService.update(id, updateDto);
  }
}
    