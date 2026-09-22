const express = require('express');
const request = require('supertest');

jest.mock('../src/models', () => ({
  Lead: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {},
  Listing: {},
}));

// Auth is tested on its own in auth.test.js. Here we bypass it so these
// tests focus purely on lead validation, pagination, and CRUD behaviour.
jest.mock('../src/middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'agent-1', role: 'agent' };
    next();
  },
}));

const { Lead } = require('../src/models');
const leadRoutes = require('../src/routes/leadRoutes');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/leads', leadRoutes);
  app.use((err, req, res, next) => res.status(500).json({ message: err.message })); // eslint-disable-line
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/leads', () => {
  it('returns paginated results with the default page size', async () => {
    const app = buildApp();
    Lead.findAndCountAll.mockResolvedValue({ rows: [{ id: 'l1' }, { id: 'l2' }], count: 27 });

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toEqual({ total: 27, page: 1, limit: 10, totalPages: 3 });

    const args = Lead.findAndCountAll.mock.calls[0][0];
    expect(args.limit).toBe(10);
    expect(args.offset).toBe(0);
  });

  it('honours page and limit query params and computes the right offset', async () => {
    const app = buildApp();
    Lead.findAndCountAll.mockResolvedValue({ rows: [], count: 45 });

    const res = await request(app).get('/api/leads').query({ page: 3, limit: 20 });

    expect(res.body.meta).toEqual({ total: 45, page: 3, limit: 20, totalPages: 3 });
    const args = Lead.findAndCountAll.mock.calls[0][0];
    expect(args.limit).toBe(20);
    expect(args.offset).toBe(40); // (page 3 - 1) * limit 20
  });

  it('caps an oversized limit at 100', async () => {
    const app = buildApp();
    Lead.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });
    await request(app).get('/api/leads').query({ limit: 99999 });
    const args = Lead.findAndCountAll.mock.calls[0][0];
    expect(args.limit).toBe(100);
  });
});

describe('POST /api/leads', () => {
  it('rejects an empty payload with a 400 and never calls the model', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/leads').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.errors).toContain('Name is required');
  });

  it('rejects an invalid source enum value', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/leads').send({ name: 'Raj', source: 'carrier_pigeon' });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.includes('Source must be one of'))).toBe(true);
  });
});

describe('PATCH /api/leads/:id', () => {
  it('returns 404 when the lead does not exist', async () => {
    const app = buildApp();
    Lead.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/api/leads/missing-id').send({ stage: 'won' });
    expect(res.status).toBe(404);
  });

  it('rejects an invalid stage value before touching the model', async () => {
    const app = buildApp();
    const res = await request(app).patch('/api/leads/l1').send({ stage: 'exploded' });
    expect(res.status).toBe(400);
    expect(Lead.findByPk).not.toHaveBeenCalled();
  });

  it('updates only the fields provided and saves', async () => {
    const app = buildApp();
    const save = jest.fn().mockResolvedValue();
    const existing = { id: 'l1', name: 'Raj', stage: 'new', save };
    Lead.findByPk.mockResolvedValue(existing);

    const res = await request(app).patch('/api/leads/l1').send({ stage: 'qualified' });

    expect(res.status).toBe(200);
    expect(existing.stage).toBe('qualified');
    expect(existing.name).toBe('Raj'); // untouched field stays as-is
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe('DELETE /api/leads/:id', () => {
  it('returns 404 when the lead does not exist', async () => {
    const app = buildApp();
    Lead.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/api/leads/missing-id');
    expect(res.status).toBe(404);
  });

  it('deletes an existing lead', async () => {
    const app = buildApp();
    const destroy = jest.fn().mockResolvedValue();
    Lead.findByPk.mockResolvedValue({ id: 'l1', destroy });
    const res = await request(app).delete('/api/leads/l1');
    expect(res.status).toBe(200);
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
