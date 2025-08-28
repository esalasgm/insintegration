import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ExternalApiRequestDto } from './external-api/dto/external-api.dto';
import { ExternalApiService } from './external-api/external-api.service';

@Controller()
export class AppController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  @Post('dynamic-execute')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async consultaDinamica(@Body() dto: ExternalApiRequestDto) {
    return this.externalApiService.callExternalApi(dto);
  }
}
