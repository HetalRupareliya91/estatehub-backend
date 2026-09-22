const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// The models layer needs a real database, so it's mocked here. Every test
// controls exactly what User.findOne / User.create / User.findByPk return.
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

// Builds a fully independent app + its own mocked User for each call, from
// one isolated module registry. This matters: if the router and the User
// mock came from different registries, the router would call a *different*
// jest.fn() than the one the test configured, and every mocked response
// would silently fall through to "undefined" instead of the intended value.
// It also gives each test its own rate-limiter instance (that state lives
// inside authRoutes.js at module scope), so tests can't bleed into each other.
function buildApp() {
  let app;
  let User;
  jest.isolateModules(() => {
    User = require('../src/models').User;
    const authRoutes = require('../src/routes/authRoutes');
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    // minimal error handler, mirrors src/middleware/errorHandler.js's fallback branch
    app.use((err, req, res, next) => res.status(500).json({ message: err.message })); // eslint-disable-line
  });
  return { app, User };
}

function fakeUser(overrides = {}) {
  return {
    id: 'user-1',
    name: 'Hetal',
    email: 'hetal@estatehub.com',
    role: 'agent',
    comparePassword: jest.fn().mockResolvedValue(true),
    toSafeObject: jest.fn(function toSafeObject() {
      return { id: this.id, name: this.name, email: this.email, role: this.role };
    }),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  it('rejects a missing name/email/password before hitting the controller', async () => {
    const { app, User } = buildApp();
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(User.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate email with 409', async () => {
    const { app, User } = buildApp();
    User.findOne.mockResolvedValue(fakeUser());

    const res = await request(app).post('/api/auth/register').send({
      name: 'Hetal', email: 'hetal@estatehub.com', password: 'secret123',
    });

    expect(res.status).toBe(409);
    expect(User.create).not.toHaveBeenCalled();
  });

  it('creates a new user and returns a token on success', async () => {
    const { app, User } = buildApp();
    User.findOne.mockResolvedValue(null);
    const created = fakeUser({ id: 'new-user-1' });
    User.create.mockResolvedValue(created);

    const res = await request(app).post('/api/auth/register').send({
      name: 'Hetal', email: 'hetal@estatehub.com', password: 'secret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.id).toBe('new-user-1');
    expect(res.body.token).toEqual(expect.any(String));
    // a real, verifiable JWT was issued, not a placeholder string
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('new-user-1');
  });
});

describe('POST /api/auth/login', () => {
  it('rejects a malformed email before hitting the controller', async () => {
    const { app, User } = buildApp();
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('returns 401 when the user does not exist', async () => {
    const { app, User } = buildApp();
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'whatever' });
    expect(res.status).toBe(401);
  });

  it('returns 401 when the password is wrong', async () => {
    const { app, User } = buildApp();
    User.findOne.mockResolvedValue(fakeUser({ comparePassword: jest.fn().mockResolvedValue(false) }));
    const res = await request(app).post('/api/auth/login').send({ email: 'hetal@estatehub.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns a token on correct credentials', async () => {
    const { app, User } = buildApp();
    User.findOne.mockResolvedValue(fakeUser());
    const res = await request(app).post('/api/auth/login').send({ email: 'hetal@estatehub.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('throttles repeated attempts from the same client past the configured limit', async () => {
    // fresh app = fresh rate-limiter instance, so this test can't be
    // polluted by (or pollute) the tests above
    const { app, User } = buildApp();
    User.findOne.mockResolvedValue(null); // every attempt "fails" - doesn't matter, limiter counts all requests

    const results = [];
    for (let i = 0; i < 6; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app).post('/api/auth/login').send({ email: 'x@y.com', password: 'whatever' });
      results.push(res.status);
    }

    expect(results.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(results[5]).toBe(429);
  });
});

describe('protect middleware (via GET /api/auth/me)', () => {
  it('rejects a request with no token', async () => {
    const { app, User } = buildApp();
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const { app, User } = buildApp();
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects a valid token for a user that no longer exists', async () => {
    const { app, User } = buildApp();
    const token = jwt.sign({ id: 'ghost-user' }, process.env.JWT_SECRET);
    User.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('loads the user and returns their safe profile for a valid token', async () => {
    const { app, User } = buildApp();
    const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET);
    User.findByPk.mockResolvedValue(fakeUser());
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('hetal@estatehub.com');
    expect(res.body.user.password).toBeUndefined(); // toSafeObject must never leak the hash
  });
});
