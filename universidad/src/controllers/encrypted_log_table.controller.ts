import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EncryptedLogTableService } from '../services/encrypted_log_table.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('encrypted-logs')
@UseGuards(JwtAuthGuard)
export class EncryptedLogTableController {
  constructor(private readonly encryptedLogTableService: EncryptedLogTableService) {}

  @Get()
  findAll(@Query('limit') limit: number) {
    return this.encryptedLogTableService.findAll(limit);
  }

  @Get('latest')
  findLatest(
    @Query('lastId') lastId: number,
    @Query('limit') limit: number,
  ) {
    return this.encryptedLogTableService.findLatest(lastId, limit);
  }

  @Get('decrypted')
  getDecryptedLogs(@Query('limit') limit: number) {
    return this.encryptedLogTableService.getDecryptedLogs(limit);
  }

  @Get('hex')
  getHexLogs(@Query('limit') limit: number) {
    return this.encryptedLogTableService.getHexLogs(limit);
  }
}
