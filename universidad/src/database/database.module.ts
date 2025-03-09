import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { TypeOrmModule } from '@nestjs/typeorm';



@Module({
  imports: [
    TypeOrmModule.forFeature([
])],
  providers: [
    DatabaseService,
],
  controllers: [DatabaseController],
  exports: [DatabaseService],
})
export class DatabaseModule {}