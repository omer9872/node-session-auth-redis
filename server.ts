import express, { Express, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import redisStore from 'connect-redis';
import session, { SessionOptions, Cookie, Session } from 'express-session';
import { auth } from './auth';
import { userSchema } from './models/user.model';

// TO USE isAuth and user FIELDS DECLARE Session INTERFACE...
declare module "express-session" {
  interface Session {
    isAuth: boolean;
    user: any
  }
}

dotenv.config();

const expressApp: Express = express();

// CONFIGURATION OF REDIS STORE...
const Store = redisStore(session);
const redisClient = createClient({ legacyMode: true })
redisClient.connect().catch(console.error)

// CONFIGURATION OF SESSION..
const sessionOptions: SessionOptions = {
  store: new Store({ client: redisClient }),
  secret: "HdohGgszw_235!.673Dh26g_",
  genid: (req: Request) => {
    return uuidv4();
  },
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60000 /* (ms) => 1min */
  }
}

expressApp.use(session(sessionOptions));
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(express.json());

// ROUTES...
expressApp.post('/login', (req: Request, res: Response) => {

  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
      return res.json({ message: result.error.details })
    }
    req.session.user = result.value;
    req.session.isAuth = true;
    return res.redirect("/check-auth");
  }
  catch (err: any) {
    return res.json({ message: err.message })
  }

})

expressApp.get('/check-auth', auth, function (req: Request, res: Response, next: NextFunction) {
  res.json({ message: "you are authenticated" })
})

expressApp.post('/logout', auth, function (req: Request, res: Response, next: NextFunction) {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ message: "error occured while logging out" })
    }
    return res.json({ message: "successfully logged out" })
  });
})


// LISTEN SERVER ON PORT...
expressApp.listen(process.env.SERVER_PORT, () => {
  console.log(`Auth Server: ${process.env.SERVER_PORT}`)
})