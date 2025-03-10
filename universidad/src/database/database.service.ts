import { Sexos } from '../entities/sexos.entity';
import { Tramites_documentos } from '../entities/tramites_documentos.entity';
import { Tipos_ambientes } from '../entities/tipos_ambientes.entity';

import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { Universidades } from '../entities/universidades.entity';
import { DatabaseModule } from './database.module';


@Injectable()
export class DatabaseService {

  private entityMap = {
    'tipos_ambientes': Tipos_ambientes,
    'tramites_documentos': Tramites_documentos,
    'sexos': Sexos,
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
    const data = await this.entityManager.query(query);
    if (data.length === 0) {
      // Si la tabla está vacía, devolver un objeto con las columnas de la tabla
      const columns = await this.getTableStructure(tableName);
      return [columns.reduce((acc, column) => {
        acc[column.column_name] = '';
        return acc;
      }, {})];
    }
    return data;
  }

  async createCrudOperations(tables: string[]) {
    console.log('⏳ Generando archivos CRUD para las tablas...');

    // Crear una carpeta de respaldo para poder restaurar en caso de error
    this.createBackup();

    try {
      for (const table of tables) {
        // Crear archivos de entidad, controlador, servicio y módulo para la tabla
        await this.createEntityFile(table);
        await this.createControllerFile(table);
        await this.createServiceFile(table);
        await this.createModuleFile(table);
        console.log(`✅ Generados archivos CRUD para: ${table}`);
      }

      // Actualizar DatabaseModule con los nuevos módulos generados
      await this.updateDatabaseModule(tables);
      console.log('✅ Actualizado database.module.ts');

      // Registrar nuevas entidades en entityMap y actualizar el archivo
      await this.updateEntityMap(tables);
      console.log('✅ Actualizado entityMap en database.service.ts');

      return { message: 'Operaciones CRUD creadas con éxito. Por favor, reinicie la aplicación.' };
    } catch (error) {
      console.error('❌ Error al generar CRUD:', error);
      this.restoreBackup();
      return { error: 'Error al generar CRUD. Se ha restaurado la versión anterior.' };
    }
  }

  private createBackup() {
    const backupDir = path.join(process.cwd(), 'backup-crud');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Hacer copia de los archivos críticos
    const databaseServicePath = path.join(process.cwd(), 'src', 'database', 'database.service.ts');
    const databaseModulePath = path.join(process.cwd(), 'src', 'database', 'database.module.ts');

    if (fs.existsSync(databaseServicePath)) {
      fs.copyFileSync(databaseServicePath, path.join(backupDir, 'database.service.ts.backup'));
    }

    if (fs.existsSync(databaseModulePath)) {
      fs.copyFileSync(databaseModulePath, path.join(backupDir, 'database.module.ts.backup'));
    }

    console.log('✅ Backup creado en directorio "backup-crud"');
  }

  private restoreBackup() {
    const backupDir = path.join(process.cwd(), 'backup-crud');
    const databaseServicePath = path.join(process.cwd(), 'src', 'database', 'database.service.ts');
    const databaseModulePath = path.join(process.cwd(), 'src', 'database', 'database.module.ts');

    if (fs.existsSync(path.join(backupDir, 'database.service.ts.backup'))) {
      fs.copyFileSync(path.join(backupDir, 'database.service.ts.backup'), databaseServicePath);
    }

    if (fs.existsSync(path.join(backupDir, 'database.module.ts.backup'))) {
      fs.copyFileSync(path.join(backupDir, 'database.module.ts.backup'), databaseModulePath);
    }

    console.log('⚠️ Se han restaurado los archivos originales del backup');
  }

  private async createEntityFile(tableName: string) {
    const columns = await this.getTableStructure(tableName);
    const entityName = this.capitalize(tableName);
    const entityContent = `import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('${tableName}')
export class ${entityName} {

  ${columns.map((column, index) => `
  ${index === 0 ? '@PrimaryColumn()' : '@Column({ nullable: true })'}
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

  private async updateDatabaseModule(tables: string[]) {
    const databaseModulePath = path.join(process.cwd(), 'src', 'database', 'database.module.ts');
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

  private async updateEntityMap(tables: string[]) {
    // Filtrar tablas que ya están en entityMap
    const newTables = tables.filter(table => !this.entityMap[table]);
    if (newTables.length === 0) return;

    const entityMapPath = path.join(process.cwd(), 'src', 'database', 'database.service.ts');
    let entityMapContent = fs.readFileSync(entityMapPath, 'utf8');

    // Crear las declaraciones de importación para las nuevas entidades
    const importStatements = newTables.map(table => {
      const entityName = this.capitalize(table);
      return `import { ${entityName} } from '../entities/${table}.entity';`;
    }).join('\n');

    // Crear las entradas del mapa de entidades para las nuevas tablas
    const entityMapEntries = newTables.map(table => {
      const entityName = this.capitalize(table);
      return `'${table}': ${entityName}`;
    }).join(',\n    ');

    // Insertar las nuevas importaciones al principio del archivo
    entityMapContent = importStatements + '\n' + entityMapContent;

    // Actualizar el mapa de entidades
    const entityMapRegex = /(private\s+entityMap\s+=\s+{)([\s\S]*?)(})/;
    const match = entityMapContent.match(entityMapRegex);

    if (match) {
      // Verificar si las entradas ya existen para evitar duplicados
      const existingEntries = match[2];
      const updatedEntries = existingEntries.trim();

      // Añadir las nuevas entradas asegurándose de que el formato sea consistente
      const separator = updatedEntries.endsWith(',') ? '\n    ' : ',\n    ';

      entityMapContent = entityMapContent.replace(
        entityMapRegex,
        `$1${updatedEntries}${separator}${entityMapEntries}\n  $3`
      );
    }

    // Guardar los cambios en el archivo
    fs.writeFileSync(entityMapPath, entityMapContent);
    console.log(`✅ Se han añadido ${newTables.length} nuevas entidades al entityMap`);

    // Actualizar el entityMap en memoria
    for (const table of newTables) {
      try {
        const entityName = this.capitalize(table);
        console.log(`✅ Registrando ${entityName} en memoria`);

        // Registrar en el mapa de entidades en memoria
        // La entidad real se cargará después del reinicio
        const entityModule = await import(`../entities/${table}.entity`);
        this.registerEntity(table, entityModule[entityName]);
      } catch (error) {
        console.error(`Error registrando entidad ${table}:`, error);
      }
    }
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
    try {
      // Buscar la entidad en el mapa
      const EntityClass = this.entityMap[tableName];

      if (!EntityClass) {
        throw new Error(`Entity for table ${tableName} not found`);
      }

      const repository = this.entityManager.getRepository(EntityClass);
      const primaryColumn = await this.getPrimaryColumn(tableName);
      return await repository.update({ [primaryColumn]: Number(id) }, record);
    } catch (error) {
      console.error('Error in updateRecord:', error);
      throw error;
    }
  }

  private async getPrimaryColumn(tableName: string): Promise<string> {
    const query = `
      SELECT column_name
      FROM information_schema.key_column_usage
      WHERE table_name = '${tableName}' AND constraint_name = '${tableName}_pkey'
    `;
    const result = await this.entityManager.query(query);
    if (result.length > 0) {
      return result[0].column_name;
    }

    // Intentar obtener la columna primaria de otra manera si no se encuentra en key_column_usage
    const primaryColumnQuery = `
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = '${tableName}'::regclass AND i.indisprimary
    `;
    const primaryColumnResult = await this.entityManager.query(primaryColumnQuery);
    if (primaryColumnResult.length > 0) {
      return primaryColumnResult[0].attname;
    }

    throw new Error(`Primary column for table ${tableName} not found`);
  }

  // Método para registrar nuevas entidades dinámicamente
  registerEntity(tableName: string, EntityClass: any) {
    this.entityMap[tableName] = EntityClass;
  }

  async deleteRecord(tableName: string, id: string) {
    return await this.entityManager.delete(tableName, id);
  }


  async restartApplication(): Promise<{ message: string }> {
    const isWindows = process.platform === 'win32';
    console.log('Llegue a restartApplication...');
    const scriptPath = path.join(process.cwd(), 'restart.js');

    // Crear un script de reinicio si no existe
    if (!fs.existsSync(scriptPath)) {
      const restartScript = `
        const { spawn } = require('child_process');
        const path = require('path');
        
        // Esperar 1 segundo para asegurarse de que el proceso padre haya completado la respuesta
        setTimeout(() => {
          console.log('Reiniciando aplicación...');
          // Iniciar el nuevo proceso
          const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
          const child = spawn(npm, ['run', 'start'], {
            detached: true,
            stdio: 'inherit',
            cwd: process.cwd()
          });
          
          child.unref();
          // Terminar el proceso actual después de iniciar el nuevo
          setTimeout(() => process.exit(0), 1000);
        }, 1000);
      `;

      fs.writeFileSync(scriptPath, restartScript);
    }

    console.log('Preparando reinicio de aplicación...');

    // Ejecutar el script de reinicio en un proceso separado
    const command = isWindows ? 'node.exe' : 'node';
    const child = exec(`${command} "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al iniciar script de reinicio: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error en stderr: ${stderr}`);
        return;
      }
      console.log(stdout);
    });

    // No esperar a que el proceso termine
    child.unref();

    return { message: 'La aplicación se reiniciará en unos momentos...' };
  }
}