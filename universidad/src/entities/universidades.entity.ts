
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('universidades')
export class Universidades {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column()
  id_universidad: number;
  
  @Column()
  nombre: string;
  
  @Column()
  nombre_abreviado: string;
  
  @Column()
  inicial: string;
  
  @Column()
  estado: string;
  
}
    