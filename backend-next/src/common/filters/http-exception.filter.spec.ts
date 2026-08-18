import { HttpException, NotFoundException } from '@nestjs/common'
import { HttpExceptionFilter } from './http-exception.filter.js'

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter

  const mockResponse = () => {
    const res: any = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }

  const mockRequest = (url = '/test', method = 'GET') => ({ url, method })

  const mockHost = (req: any, res: any) =>
    ({
      switchToHttp: () => ({
        getResponse: () => res,
        getRequest: () => req,
      }),
    }) as any

  beforeEach(() => {
    filter = new HttpExceptionFilter()
  })

  it('should return status code and string message', () => {
    const exception = new HttpException('Not found', 404)
    const res = mockResponse()
    const req = mockRequest()
    filter.catch(exception, mockHost(req, res))

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not found',
        path: '/test',
      }),
    )
  })

  it('should extract message from object response', () => {
    const exception = new HttpException(
      { message: ['email must be an email'], error: 'Bad Request' },
      400,
    )
    const res = mockResponse()
    const req = mockRequest('/api/users', 'POST')
    filter.catch(exception, mockHost(req, res))

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['email must be an email'],
        path: '/api/users',
      }),
    )
  })

  it('should include timestamp in response', () => {
    const exception = new HttpException('Error', 500)
    const res = mockResponse()
    filter.catch(exception, mockHost(mockRequest(), res))

    const body = res.json.mock.calls[0][0]
    expect(body.timestamp).toBeDefined()
    expect(new Date(body.timestamp).getTime()).not.toBeNaN()
  })
})
