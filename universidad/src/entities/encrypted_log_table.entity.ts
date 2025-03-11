import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('encrypted_log_table')
export class EncryptedLogTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bytea')
  table_name: Buffer;

  @Column('bytea')
  id_registro_tabla_modificada: Buffer;

  @Column('bytea')
  action: Buffer;

  @Column('bytea')
  date: Buffer;
}
