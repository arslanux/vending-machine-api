import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
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
      throw new UnauthorizedException('Maximum number of active sessions reached. Please log out from another device.');
    }
    
    userSessions.add(token);
    
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
    }
  }

  async logoutAll(username: string) {
    this.activeSessions.delete(username);
  }

  isTokenActive(username: string, token: string): boolean {
    const sessions = this.activeSessions.get(username);
    return sessions ? sessions.has(token) : false;
  }
}