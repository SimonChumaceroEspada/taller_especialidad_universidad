/* import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthclsController } from './authcls/authcls.controller';

@Module({
  imports: [AuthModule],
  controllers: [AppController, AuthclsController],
  providers: [AppService],
})
export class AppModule {}
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "dbpostgrado",
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    DatabaseModule,
  ],
})
export class AppModule {}
