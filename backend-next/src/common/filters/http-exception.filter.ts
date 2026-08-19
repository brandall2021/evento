import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const message = typeof exceptionResponse === 'string'
      ? { message: exceptionResponse }
      : typeof exceptionResponse === 'object'
        ? exceptionResponse as Record<string, unknown>
        : { message: String(exceptionResponse) }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...message,
    })
  }
}
