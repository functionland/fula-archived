import { ParameterizedContext, Next } from 'koa';
import Router from '@koa/router';

interface State {}
  
export const router = new Router<State>();

type Context = ParameterizedContext<State, Router.RouterParamContext<State>>;
type Middleware = (ctx: Context, next: Next) => Promise<any>;

const aMiddleware: Middleware = async (ctx, next) => {
  await next();
};

router.get('/graph/v1', aMiddleware, async (ctx, next) => {
  ctx.body = "<h1>graph v1 root<h1>"
  await next();
});
