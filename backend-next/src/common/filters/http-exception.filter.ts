import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const message = typeof exceptionResponse === 'string'
      ? { message: exceptionResponse }
      : typeof exceptionResponse === 'object'
        ? exceptionResponse as Record<string, unknown>
        : { message: String(exceptionResponse) }

    this.logger.warn(`${request.method} ${request.url} -> ${status}`)

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...message,
    })
  }
}
