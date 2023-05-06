import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';

console.log(process.env.STAGE);

async function bootstrap() {
    const logger = new Logger();
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new TransformInterceptor());
    const port = 3000;
    await app.listen(port);
    logger.log(`Application listening on port ${port}`);
}
bootstrap();
