
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('universidades')
export class Universidades {  
  @PrimaryColumn()
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
    