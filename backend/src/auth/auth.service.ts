import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private activeSessions: Map<string, Set<string>> = new Map();

  constructor(
    private userService: UserService,
    private jwtService: JwtService
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
    this.activeSessions.get(user.username).add(token);
    
    return {
      access_token: token,
      username: user.username,
      role: user.role
    };
  }

  async isTokenActive(username: string, userId: string): Promise<boolean> {
    const userSessions = this.activeSessions.get(username);
    if (!userSessions) return false;

    for (const token of userSessions) {
      try {
        const payload = this.jwtService.verify(token);
        if (payload.sub === userId) {
          return true;
        }
      } catch (error) {
        // Token is invalid or expired, remove it
        userSessions.delete(token);
      }
    }
    return false;
  }

  logout(username: string, token: string) {
    const userSessions = this.activeSessions.get(username);
    if (userSessions) {
      userSessions.delete(token);
      if (userSessions.size === 0) {
        this.activeSessions.delete(username);
      }
    }
  }

  logoutAll(username: string) {
    this.activeSessions.delete(username);
  }
}