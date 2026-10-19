import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

// Response bodies are untyped JSON, these describe what we expect
type UserBody = { id: string; email: string; name: string };
type ErrorBody = { statusCode: number; message: string[]; path: string };

// The whole app over real HTTP, with a throwaway in-memory MongoDB
describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer;

  const user = { email: 'sara@test.com', name: 'Sara', password: 'Passw0rd!' };

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    // Set before AppModule loads; real env vars win over the .env file
    process.env.MONGODB_URI = mongo.getUri();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '3600';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // The rate limit would block this many requests in a row
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  // "?." so a failed beforeAll doesn't hide its real error behind a second one
  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  it('POST /auth/signup creates the user and sets an httpOnly cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(201);

    const body = res.body as UserBody;
    expect(body).toEqual({ id: body.id, email: user.email, name: user.name });
    expect(typeof body.id).toBe('string'); // and no password field
    expect(res.headers['set-cookie'][0]).toMatch(/access_token=.+; .*HttpOnly/);
  });

  it('POST /auth/signup rejects invalid fields with 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'nope', name: 'Ab', password: 'password' })
      .expect(400);

    // One message per failed field. Password breaks two @Matches rules but class-validator
    // keys errors by constraint name ("matches"), so only one password rule is reported.
    const { message } = res.body as ErrorBody;
    expect(message).toContain('Email must be a valid email address');
    expect(message).toContain('Name must be at least 3 characters');
    expect(message.join()).toMatch(/Password must contain/);
  });

  it('POST /auth/signup returns 409 for an existing email (case-insensitive)', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ ...user, email: 'SARA@test.com' })
      .expect(409);
  });

  it('POST /auth/signin returns 401 for a wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: user.email, password: 'WrongPass1!' })
      .expect(401);
  });

  it('GET /users/me returns 401 without a cookie', async () => {
    const res = await request(app.getHttpServer()).get('/users/me').expect(401);

    // Shape added by AllExceptionsFilter
    expect(res.body).toMatchObject({ statusCode: 401, path: '/users/me' });
  });

  it('sign in -> /users/me -> sign out -> /users/me', async () => {
    // agent() keeps cookies between requests, like a browser
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/signin')
      .send({ email: user.email, password: user.password })
      .expect(200);

    const me = await agent.get('/users/me').expect(200);
    expect(me.body).toMatchObject({ email: user.email, name: user.name });

    await agent.post('/auth/signout').expect(204);
    await agent.get('/users/me').expect(401);
  });
});
