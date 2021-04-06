import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { router } from './routes';
import settings from './settings';

const app = new Koa();

app
  .use(bodyParser())
  .use(router.routes())
  .use(logger());

app.listen(settings.port, () =>
  console.log(`Server is running on port ${settings.port}...`)
);
