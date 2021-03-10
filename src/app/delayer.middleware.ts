import * as DelayedResponse from 'http-delayed-response'

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DelayerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    new DelayedResponse(req, res)
    next();
  }
}
