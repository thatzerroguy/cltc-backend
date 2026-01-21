import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const accessTokenSecret = config.get<string>('jwt.access.secret');
    if (!accessTokenSecret) {
      new Logger(JwtStrategy.name).error('JWT access secret is not defined');
      throw new Error('JWT access secret is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessTokenSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): { user_id: string; username: string } {
    return { user_id: payload.sub, username: payload.username };
  }
}
