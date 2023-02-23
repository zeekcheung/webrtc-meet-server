import { NextFunction, Response } from 'express';

/**
 * 在所有响应中添加 'Access-Control-Allow-Private-Network' 字段，以允许从公网访问服务器
 */
export function allowPrivateNetworkMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.set('Access-Control-Allow-Private-Network', 'true');
  next();
}
