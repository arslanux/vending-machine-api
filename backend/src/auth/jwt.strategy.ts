import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    this.logger.log(`Validating token for user ${payload.username}`);
    const isActive = this.authService.isTokenActive(payload.username, payload.sub);
    if (!isActive) {
      this.logger.warn(`Inactive session for user ${payload.username}`);
      throw new UnauthorizedException('Inactive session');
    }
    this.logger.log(`Token validated for user ${payload.username}`);
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}