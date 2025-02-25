import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    // Simulación de usuario (deberías obtenerlo de la base de datos)
    const user = { id: 1, username: "admin", password: await bcrypt.hash("123456", 10) };

    if (username === user.username && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    return null;
  }
}
