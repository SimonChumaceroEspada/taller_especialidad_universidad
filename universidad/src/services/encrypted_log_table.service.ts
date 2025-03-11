import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptedLogTable } from '../entities/encrypted_log_table.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class EncryptedLogTableService {
  constructor(
    @InjectRepository(EncryptedLogTable)
    private readonly encryptedLogTableRepository: Repository<EncryptedLogTable>,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  findAll(limit: number = 100): Promise<EncryptedLogTable[]> {
    return this.encryptedLogTableRepository.find({
      order: {
        id: 'DESC',
      },
      take: limit,
    });
  }

  findLatest(lastId: number, limit: number = 10): Promise<EncryptedLogTable[]> {
    return this.encryptedLogTableRepository.find({
      where: {
        id: lastId > 0 ? lastId : undefined,
      },
      order: {
        id: 'DESC',
      },
      take: limit,
    });
  }

  // Método para obtener registros encriptados en formato hexadecimal
  async getHexLogs(limit: number = 50): Promise<any[]> {
    try {
      const encryptedLogs = await this.findAll(limit);
      
      // Convertir los buffers a strings hexadecimales para visualización
      return encryptedLogs.map(log => {
        return {
          id: log.id,
          table_name: this.bufferToHex(log.table_name),
          id_registro_tabla_modificada: this.bufferToHex(log.id_registro_tabla_modificada),
          action: this.bufferToHex(log.action),
          date: this.bufferToHex(log.date),
          raw: true // Indicador de que los datos están en formato hexadecimal sin procesar
        };
      });
    } catch (error) {
      console.error('Error al obtener datos encriptados:', error);
      return [];
    }
  }

  // Método para obtener registros desencriptados
  async getDecryptedLogs(limit: number = 50): Promise<any[]> {
    // Esta función ahora simplemente redirige a getHexLogs para mostrar datos sin desencriptar
    return this.getHexLogs(limit);
  }

  // Método mejorado para convertir Buffer a representación hexadecimal
  private bufferToHex(buffer: Buffer): string {
    if (!buffer) return 'N/A';
    try {
      // Formato hexadecimal más legible
      const hex = buffer.toString('hex');
      return this.formatHex(hex);
    } catch (e) {
      return 'Error en formato';
    }
  }

  // Formatea un string hexadecimal para hacerlo más legible
  private formatHex(hex: string): string {
    // Agrupa los caracteres hexadecimales en grupos de 2 y agrega espacios
    return hex.match(/.{1,2}/g)?.join(' ') || hex;
  }
}
