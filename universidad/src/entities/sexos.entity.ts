import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sexos')
export class Sexos {

  
  @PrimaryColumn()
  id_sexo: number;
  
  @Column({ nullable: true })
  nombre: string;
  
  @Column({ nullable: true })
  estado: string;
  
}
    