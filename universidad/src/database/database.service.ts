import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async getAllTables(): Promise<string[]> {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC
    `;
    
    const tables = await this.entityManager.query(query);
    return tables.map(table => table.table_name);
  }

  private async getTableStructure(tableName: string) {
    const query = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
    `;
    return await this.entityManager.query(query);
  }

  async getTableData(tableName: string) {
    const query = `SELECT * FROM "${tableName}" LIMIT 100`;
    return await this.entityManager.query(query);
  }

  async createCrudOperations(tables: string[]) {
    for (const table of tables) {
      // Crear archivos de entidad, controlador, servicio y módulo para la tabla
      await this.createEntityFile(table);
      await this.createControllerFile(table);
      await this.createServiceFile(table);
      await this.createModuleFile(table);
    }
    // Actualizar AppModule con los nuevos módulos generados
    await this.updateAppModule(tables);
    return { message: 'Operaciones CRUD creadas con éxito' };
  }

  private async createEntityFile(tableName: string) {
    const columns = await this.getTableStructure(tableName);
    const entityName = this.capitalize(tableName);
    const entityContent = `
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('${tableName}')
export class ${entityName} {
  @PrimaryGeneratedColumn()
  id: number;

  ${columns.map(column => `
  @Column()
  ${column.column_name}: ${this.mapDataType(column.data_type)};
  `).join('')}
}
    `;
    const entityDir = path.join(__dirname, '..', 'entities');
    const entityPath = path.join(entityDir, `${tableName}.entity.ts`);

    // Crear el directorio si no existe
    if (!fs.existsSync(entityDir)) {
      fs.mkdirSync(entityDir, { recursive: true });
    }

    fs.writeFileSync(entityPath, entityContent);
  }

  private async createControllerFile(tableName: string) {
    const entityName = this.capitalize(tableName);
    const controllerContent = `
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ${entityName}Service } from '../services/${tableName}.service';
import { ${entityName} } from '../entities/${tableName}.entity';

@Controller('${tableName}')
export class ${entityName}Controller {
  constructor(private readonly ${tableName}Service: ${entityName}Service) {}

  @Get()
  findAll() {
    return this.${tableName}Service.findAll();
  }

  @Post()
  create(@Body() createDto: ${entityName}) {
    return this.${tableName}Service.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: ${entityName}) {
    return this.${tableName}Service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${tableName}Service.remove(id);
  }
}
    `;
    const controllerDir = path.join(__dirname, '..', 'controllers');
    const controllerPath = path.join(controllerDir, `${tableName}.controller.ts`);

    // Crear el directorio si no existe
    if (!fs.existsSync(controllerDir)) {
      fs.mkdirSync(controllerDir, { recursive: true });
    }

    fs.writeFileSync(controllerPath, controllerContent);
  }

  private async createServiceFile(tableName: string) {
    const entityName = this.capitalize(tableName);
    const serviceContent = `
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${entityName} } from '../entities/${tableName}.entity';

@Injectable()
export class ${entityName}Service {
  constructor(
    @InjectRepository(${entityName})
    private readonly ${tableName}Repository: Repository<${entityName}>,
  ) {}

  findAll(): Promise<${entityName}[]> {
    return this.${tableName}Repository.find();
  }

  create(createDto: ${entityName}): Promise<${entityName}> {
    const entity = this.${tableName}Repository.create(createDto);
    return this.${tableName}Repository.save(entity);
  }

  update(id: string, updateDto: ${entityName}): Promise<${entityName}> {
    return this.${tableName}Repository.save({ ...updateDto, id: Number(id) });
  }

  remove(id: string): Promise<void> {
    return this.${tableName}Repository.delete(id).then(() => {});
  }
}
    `;
    const serviceDir = path.join(__dirname, '..', 'services');
    const servicePath = path.join(serviceDir, `${tableName}.service.ts`);

    // Crear el directorio si no existe
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }

    fs.writeFileSync(servicePath, serviceContent);
  }

  private async createModuleFile(tableName: string) {
    const entityName = this.capitalize(tableName);
    const moduleContent = `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${entityName} } from '../entities/${tableName}.entity';
import { ${entityName}Service } from '../services/${tableName}.service';
import { ${entityName}Controller } from '../controllers/${tableName}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([${entityName}])],
  providers: [${entityName}Service],
  controllers: [${entityName}Controller],
})
export class ${entityName}Module {}
    `;
    const moduleDir = path.join(__dirname, '..', 'modules');
    const modulePath = path.join(moduleDir, `${tableName}.module.ts`);

    // Crear el directorio si no existe
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    fs.writeFileSync(modulePath, moduleContent);
  }

  private async updateAppModule(tables: string[]) {
    const appModulePath = path.join(__dirname, '..', 'app.module.ts');
    let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

    const importStatements = tables.map(table => {
      const entityName = this.capitalize(table);
      return `import { ${entityName}Module } from './modules/${table}.module';`;
    }).join('\n');

    const moduleImports = tables.map(table => {
      const entityName = this.capitalize(table);
      return `${entityName}Module`;
    }).join(', ');

    const importRegex = /(imports:\s*\[)([\s\S]*?)(\])/;
    const newImports = `$1\n    ${moduleImports},\n$3`;

    appModuleContent = `${importStatements}\n\n${appModuleContent.replace(importRegex, newImports)}`;

    fs.writeFileSync(appModulePath, appModuleContent);
  }

  private mapDataType(dataType: string): string {
    switch (dataType) {
      case 'integer':
        return 'number';
      case 'character varying':
      case 'text':
        return 'string';
      case 'boolean':
        return 'boolean';
      default:
        return 'any';
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}