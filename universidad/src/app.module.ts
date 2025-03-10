import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'dbpostgrado',
      autoLoadEntities: true,
      synchronize: false, // Disable automatic synchronization
    }),
    AuthModule,
    DatabaseModule,
  ],
  controllers: [HealthController], // Añadimos HealthController aquí
})
export class AppModule {}