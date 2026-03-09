import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ReviewFileDto } from './dto/review-file.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface RequestWithUser extends Request {
  user: {
    id: string;
    role: string;
    department_id: string;
    sub_role?: string;
  };
}

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @Roles('ADMIN', 'SUPER_ADMIN', 'STAFF', 'HOD', 'DG') // Update roles to match new Enum? Allow all authenticated for upload?
  // project.md: "Files can be uploaded by users" (All users)
  // So I should remove specific @Roles or create a generic 'user' role check?
  // Or just rely on AuthGuard.
  // The @Roles decorator checks against metadata.
  // I should probably remove @Roles restriction for upload if "All users" can upload. 
  // keeping it consistent with "admin", "super_admin" for now but adding others if I knew them. 
  // Safest is to rely on AuthGuard('jwt') and let Service handle logic if needed.
  // But for this specific edit, I am focusing on findAll.
  // I will just update RequestWithUser and findAll.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    return this.filesService.uploadFile(req.user, file, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Request() req: RequestWithUser) {
    return this.filesService.findAll(req.user);
  }

  @Post(':id/review')
  @Roles('ADMIN', 'SUPER_ADMIN', 'HOD', 'DG') // RBAC handles basic roles, Service handles Head check
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async reviewFile(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: ReviewFileDto,
  ) {
    return this.filesService.reviewFile(id, req.user, dto);
  }
}
