import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const result = await this.authService.validateUser(body.username, body.password);
    if (!result) {
      throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
    }
    return result;
  }
}
