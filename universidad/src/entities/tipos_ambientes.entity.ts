
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tipos_ambientes')
export class Tipos_ambientes {
  @PrimaryColumn()
  id_tipo_ambiente: number;

  
  @Column({ nullable: true })
  nombre: string;
  
  @Column({ nullable: true })
  estado: string;
  
}
    