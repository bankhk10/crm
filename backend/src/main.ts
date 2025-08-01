// File: backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Simplified for GCP
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('The API documentation for the CRM system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // This is the crucial part for Cloud Run
  const port = process.env.PORT || 3001;
  
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
}
bootstrap();