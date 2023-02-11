import { UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SESSION_ID_NAME } from 'src/common/constant';

/**
 * 验证用户是否已经登录的中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // console.log('authenticate middleware works!');
  const { cookies, session } = req;
  const sessionId = session.id;
  /**
   * 判断 cookie 中是否存在 sessionId
   * 判断 session 中是否存在该 sessionId
   */
  if (cookies[SESSION_ID_NAME] && session[sessionId]) {
    next();
  } else {
    throw new UnauthorizedException(`You haven't logged in yet!`);
  }
}
