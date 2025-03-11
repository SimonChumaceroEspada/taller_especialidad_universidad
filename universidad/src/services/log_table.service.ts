import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogTable } from '../entities/log_table.entity';

@Injectable()
export class LogTableService {
  constructor(
    @InjectRepository(LogTable)
    private readonly logTableRepository: Repository<LogTable>,
  ) {}

  findAll(limit: number = 100): Promise<LogTable[]> {
    return this.logTableRepository.find({
      order: {
        id: 'DESC',
      },
      take: limit || 100,
    });
  }

  findLatest(lastId: number, limit: number = 10): Promise<LogTable[]> {
    return this.logTableRepository.find({
      where: {
        id: lastId > 0 ? lastId : undefined,
      },
      order: {
        id: 'DESC',
      },
      take: limit || 10,
    });
  }

  findByTable(tableName: string, limit: number = 50): Promise<LogTable[]> {
    return this.logTableRepository.find({
      where: {
        table_name: tableName,
      },
      order: {
        id: 'DESC',
      },
      take: limit || 50,
    });
  }
}
