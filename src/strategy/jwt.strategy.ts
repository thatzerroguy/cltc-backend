import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DrizzleDatabase } from '../database/database.provider';
import { userSchema } from '../database/schema/user.schema';
import { eq } from 'drizzle-orm';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject('DRIZZLE') private readonly db: DrizzleDatabase,
  ) {
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

  async validate(payload: JwtPayload) {
    const [user] = await this.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, payload.sub))
      .limit(1);

    if (!user) {
      console.log('JwtStrategy: User not found for payload', payload);
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    
    return { ...result, role: result.role.toUpperCase() };
  }
}
