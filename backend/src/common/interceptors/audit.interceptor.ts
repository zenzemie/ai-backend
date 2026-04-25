import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.prisma.auditLog.create({
              data: {
                userId: user?.id || 'anonymous',
                action: `${method} ${url}`,
                resourceType: url.split('/')[1],
                metadata: {
                  body,
                  response: data,
                },
              },
            });
          } catch (error) {
            console.error('Failed to create audit log', error);
          }
        }),
      );
    }

    return next.handle();
  }
}
