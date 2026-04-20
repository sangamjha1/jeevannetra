import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate critical environment variables
  const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
  const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    logger.error(`MISSING REQUIRED ENVIRONMENT VARIABLES: ${missingEnvs.join(', ')}`);
    logger.error('Please check your .env file. The application cannot start safely without these.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Security & Performance Middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow localhost and dev tunnels for development
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://192.168.1.7:3000',
        /\.devtunnels\.ms$/,  // Allow all devtunnels.ms domains
      ];

      if (!origin || allowedOrigins.some(allowed => 
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Hospital Management System API')
    .setDescription('The API documentation for CHMS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
