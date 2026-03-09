import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { AuthService } from 'src/auth/auth.service';
import { DrizzleDatabase } from 'src/database/database.provider';
import { newsSchema } from 'src/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(AuthService.name);
  constructor(@Inject('DRIZZLE') private readonly drizzle: DrizzleDatabase) {}
  async create(createNewsDto: CreateNewsDto, user_id: string) {
    const [news] = await this.drizzle
      .insert(newsSchema)
      .values({
        title: createNewsDto.title,
        content: createNewsDto.content,
        excerpt: createNewsDto.excerpt,
        authorId: user_id,
        authorName: createNewsDto.authorName,
        publishDate: createNewsDto.publishDate,
        mainImage: createNewsDto.mainImage,
        optionalImages: createNewsDto.optionalImages,
        status: createNewsDto.status,
      })
      .returning();
    return news;
  }

  async findAll() {
    const news = await this.drizzle.query.newsSchema.findMany();
    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    try {
      // Find the news by id
      const news = await this.drizzle.query.newsSchema.findFirst({
        where: (news, { eq }) => eq(news.id, id),
      });
      if (!news) {
        throw new HttpException('News not found', HttpStatus.NOT_FOUND);
      }

      // Update the news
      const updatedNews = await this.drizzle
        .update(newsSchema)
        .set(updateNewsDto)
        .where(eq(newsSchema.id, id))
        .returning();
      return updatedNews[0];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.log(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} news`;
  }
}
