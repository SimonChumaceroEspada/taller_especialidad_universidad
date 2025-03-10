import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tramites_documentos')
export class Tramites_documentos {

  
  @PrimaryColumn()
  id_tramite_documento: number;
  
  @Column({ nullable: true })
  nombre: string;
  
  @Column({ nullable: true })
  descripcion: string;
  
  @Column({ nullable: true })
  estado: string;
  
}
    