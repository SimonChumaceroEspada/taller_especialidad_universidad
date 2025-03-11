import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('log_table')
export class LogTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  table_name: string;

  @Column()
  id_registro_tabla_modificada: number;

  @Column()
  action: string;

  @Column()
  date: Date;
}
