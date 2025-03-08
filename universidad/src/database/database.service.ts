import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity'; // Importación directa
import { DatabaseModule } from './database.module';

@Injectable()
export class DatabaseService {

  private entityMap = {
    'tipos_ambientes': Tipos_ambientes
  };
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) { }

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
    await this.updateDatabaseModule(tables);
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
    const entityDir = path.join(process.cwd(), 'src', 'entities');
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
}
    `;
    const controllerDir = path.join(process.cwd(), 'src', 'controllers');
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
}
    `;
    const serviceDir = path.join(process.cwd(), 'src', 'services');
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
    const moduleDir = path.join(process.cwd(), 'src', 'modules');
    const modulePath = path.join(moduleDir, `${tableName}.module.ts`);

    // Crear directorio si no existe
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    fs.writeFileSync(modulePath, moduleContent);
  }

  private async updateAppModule(tables: string[]) {
    const appModulePath = path.join('src', 'app.module.ts');
    let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

    const importStatements = tables.map(table => {
      const entityName = this.capitalize(table);
      return `import { ${entityName}Module } from '../src/modules/${table}.module';\nimport { ${entityName} } from '../src/entities/${table}.entity';`;
    }).join('\n');

    const moduleImports = tables.map(table => {
      const entityName = this.capitalize(table);
      return `${entityName}Module`;
    });

    const entityImports = tables.map(table => {
      const entityName = this.capitalize(table);
      return `${entityName}`;
    });

    // Agregar nuevas declaraciones de importación sin eliminar las existentes
    const importStatementsRegex = /import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?/g;
    const existingImportStatements = appModuleContent.match(importStatementsRegex) || [];
    const newImportStatements = Array.from(new Set([...existingImportStatements, ...importStatements.split('\n')])).join('\n');
    appModuleContent = appModuleContent.replace(/^(import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?)/gm, '').trim();
    appModuleContent = `${newImportStatements}\n\n${appModuleContent}`;

    // Agregar nuevos imports sin eliminar los existentes
    const importRegex = /(imports:\s*\[)([\s\S]*?)(\])/;
    const existingImportsMatch = appModuleContent.match(importRegex);
    if (existingImportsMatch) {
      const existingImports = existingImportsMatch[2].split(',').map(i => i.trim()).filter(i => i);
      const newImports = Array.from(new Set([...existingImports, ...moduleImports])).join(', ');
      appModuleContent = appModuleContent.replace(importRegex, `$1\n    ${newImports},\n$3`);
    }

    // Agregar nuevas entidades sin eliminar las existentes
    const entitiesRegex = /(entities:\s*\[)([\s\S]*?)(\])/;
    const existingEntitiesMatch = appModuleContent.match(entitiesRegex);
    if (existingEntitiesMatch) {
      const existingEntities = existingEntitiesMatch[2].split(',').map(i => i.trim()).filter(i => i);
      const newEntities = Array.from(new Set([...existingEntities, ...entityImports])).join(', ');
      appModuleContent = appModuleContent.replace(entitiesRegex, `$1\n    ${newEntities},\n$3`);
    } else {
      // Si no hay una sección de entidades, agregarla
      const typeOrmModuleRegex = /TypeOrmModule\.forRoot\(\{([\s\S]*?)\}\)/;
      appModuleContent = appModuleContent.replace(typeOrmModuleRegex, (match, p1) => {
        // Eliminar cualquier coma adicional al final de p1
        const cleanedP1 = p1.replace(/,\s*$/, '');
        return `TypeOrmModule.forRoot({${cleanedP1},\n  entities: [${entityImports.join(', ')}]})`;
      });
    }

    fs.writeFileSync(appModulePath, appModuleContent);
  }

  private async updateDatabaseModule(tables: string[]) {
    const databaseModulePath = path.join('src', 'database', 'database.module.ts');
    let databaseModuleContent = fs.readFileSync(databaseModulePath, 'utf8');

    const importStatements = tables.map(table => {
      const entityName = this.capitalize(table);
      return `import { ${entityName} } from '../entities/${table}.entity';\nimport { ${entityName}Service } from '../services/${table}.service';\nimport { ${entityName}Controller } from '../controllers/${table}.controller';`;
    }).join('\n');

    const moduleImports = tables.map(table => {
      const entityName = this.capitalize(table);
      return `${entityName}`;
    });

    const serviceProviders = tables.map(table => {
      const entityName = this.capitalize(table);
      return `${entityName}Service`;
    });

    const controllerProviders = tables.map(table => {
      const entityName = this.capitalize(table);
      return `${entityName}Controller`;
    });

    // Add new import statements without removing existing ones
    const importStatementsRegex = /import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?/g;
    const existingImportStatements = databaseModuleContent.match(importStatementsRegex) || [];
    const newImportStatements = Array.from(new Set([...existingImportStatements, ...importStatements.split('\n')])).join('\n');
    databaseModuleContent = databaseModuleContent.replace(/^(import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?)/gm, '').trim();
    databaseModuleContent = `${newImportStatements}\n\n${databaseModuleContent}`;

    // Add new imports without removing existing ones
    const importRegex = /(imports:\s*\[)([\s\S]*?)(\])/;
    const existingImportsMatch = databaseModuleContent.match(importRegex);
    if (existingImportsMatch) {
      const existingImports = existingImportsMatch[2].split(',').map(i => i.trim()).filter(i => i);
      const newImports = Array.from(new Set([...existingImports, ...moduleImports])).join(', ');
      databaseModuleContent = databaseModuleContent.replace(importRegex, `$1\n    ${newImports},\n$3`);
    }

    // Add new providers without removing existing ones
    const providersRegex = /(providers:\s*\[)([\s\S]*?)(\])/;
    const existingProvidersMatch = databaseModuleContent.match(providersRegex);
    if (existingProvidersMatch) {
      const existingProviders = existingProvidersMatch[2].split(',').map(i => i.trim()).filter(i => i);
      const newProviders = Array.from(new Set([...existingProviders, ...serviceProviders, ...controllerProviders])).join(', ');
      databaseModuleContent = databaseModuleContent.replace(providersRegex, `$1\n    ${newProviders},\n$3`);
    }

    fs.writeFileSync(databaseModulePath, databaseModuleContent);
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

  async createRecord(tableName: string, record: any) {
    return await this.entityManager.insert(tableName, record);
  }

  async updateRecord(tableName: string, id: string, record: any) {
    console.log("llegue al updateRecord");
    console.log(tableName, id, record);

    try {
      // Buscar la entidad en el mapa
      const EntityClass = this.entityMap[tableName];

      if (!EntityClass) {
        throw new Error(`Entity for table ${tableName} not found`);
      }

      const repository = this.entityManager.getRepository(EntityClass);
      return await repository.update({ id_tipo_ambiente: Number(id) }, record);
    } catch (error) {
      console.error('Error in updateRecord:', error);
      throw error;
    }
  }

  // Método para registrar nuevas entidades dinámicamente
  registerEntity(tableName: string, EntityClass: any) {
    this.entityMap[tableName] = EntityClass;
  }



  async deleteRecord(tableName: string, id: string) {
    return await this.entityManager.delete(tableName, id);
  }
}