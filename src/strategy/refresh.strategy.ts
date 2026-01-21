import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(config: ConfigService) {
    const refreshTokenSecret = config.get<string>('jwt.refresh.secret');
    if (!refreshTokenSecret) {
      new Logger(RefreshJwtStrategy.name).error(
        'JWT refresh secret is not defined',
      );
      throw new Error('JWT refresh secret is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromBodyField('refreshToken'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: refreshTokenSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): { user_id: string } {
    return { user_id: payload.sub };
  }
}
