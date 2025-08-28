import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { ExternalApiService } from './external-api/external-api.service';
import { HttpExternalClientService } from './common/http-external-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AuthService, ExternalApiService, HttpExternalClientService],
})
export class AppModule {}
