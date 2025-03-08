import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UniversidadesModule } from '../src/modules/universidades.module';
import { Universidades } from '../src/entities/universidades.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', host: 'localhost', port: 5432, username: 'postgres', password: 'postgres', database: 'dbpostgrado', autoLoadEntities: true, synchronize: true,
  entities: [Universidades]}), AuthModule, DatabaseModule, UniversidadesModule,
],
})
export class AppModule {}