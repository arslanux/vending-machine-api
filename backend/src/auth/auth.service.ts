import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private activeSessions: Map<string, Set<string>> = new Map();

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    
    if (!this.activeSessions.has(user.username)) {
      this.activeSessions.set(user.username, new Set());
    }
    
    const userSessions = this.activeSessions.get(user.username);
    if (userSessions.size >= 5) {
      throw new UnauthorizedException('Maximum number of active sessions reached');
    }
    
    userSessions.add(token);
    this.logger.log(`User ${user.username} logged in. Active sessions: ${userSessions.size}`);
    
    return {
      access_token: token,
      username: user.username,
      role: user.role
    };
  }

  async logout(username: string, token: string) {
    const sessions = this.activeSessions.get(username);
    if (sessions) {
      sessions.delete(token);
      if (sessions.size === 0) {
        this.activeSessions.delete(username);
      }
      this.logger.log(`User ${username} logged out. Remaining sessions: ${sessions.size}`);
    }
  }

  async logoutAll(username: string) {
    this.activeSessions.delete(username);
    this.logger.log(`All sessions for user ${username} terminated`);
  }

  isTokenActive(username: string, userId: string): boolean {
    const sessions = this.activeSessions.get(username);
    if (!sessions) {
      this.logger.warn(`No active sessions found for user ${username}`);
      return false;
    }
    
    for (const token of sessions) {
      try {
        const decoded = this.jwtService.verify(token);
        if (decoded.sub === userId) {
          this.logger.log(`Valid token found for user ${username}`);
          return true;
        }
      } catch (error) {
        this.logger.warn(`Invalid token found for user ${username}`, error.message);
        sessions.delete(token);
      }
    }
    this.logger.warn(`No valid token found for user ${username}`);
    return false;
  }
}