import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from '@/router';
import { ENVIRONMENT } from '@/common/environments/environment';

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.json());
app.use(
  cors({
    origin: ENVIRONMENT.clientUrl,
    credentials: true, // Cookies
  })
);

app.use(
  '/api',
  (req, res, next) => {
    console.log(req.hostname + ' sends request.');
    if (req.body && Object.keys(req.body).length > 0) console.log('body:', req.body);
    if (req.query && Object.keys(req.query).length > 0) console.log('query:', req.query);
    if (req.params && Object.keys(req.params).length > 0) console.log('params:', req.params);
    next();
  },
  router
);

export default app;
