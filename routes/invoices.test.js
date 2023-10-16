const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { createData } = require('../create_test_data');

beforeEach(createData);

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM industries`);
});

afterAll(async () => {
	await db.end();
});

describe('GET /', () => {
  test('It should return an array of invoices', async () => {
    const resp = await request(app).get('/invoices');
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      invoices: [
        { id: 1, comp_code: 'code1' },
        { id: 2, comp_code: 'code2' },
        { id: 3, comp_code: 'code2' }
      ]
    });
  });
});

describe('GET /:id', () => {
  test('It should return a single invoice corresponding to id in parameter', async () => {
    const resp = await request(app).get('/invoices/1');
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      "invoice": {
        id: 1,
        amt: 100,
        paid: false,
        add_date: '2021-01-01T08:00:00.000Z',
        paid_date: null,
        company: {
          code: 'code1',
          name: 'Comp1',
          description: 'Decscription1',
        }
      }
    });
  });
  test('It should return 404 for invalid invoice id', async () => {
    const resp = await request(app).get('/invoices/4');
    expect(resp.statusCode).toBe(404);
  });
});

describe('POST /', () => {
  test('It should create a new invoice and return that invoice', async () => {
    const resp = await request(app).post('/invoices').send({
      comp_code: 'code1',
      amt: 400
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      invoice: {
        id: 4,
        comp_code: 'code1',
        amt: 400,
        paid: false,
        add_date: expect.any(String),
        paid_date: null
      }
    });
  });
  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .post("/invoices")
        .send({});
    expect(response.status).toEqual(500);
  })
});

describe('PUT /:id', () => {
  test('It should update an existing invoice and return that invoice', async () => {
    const resp = await request(app).put('/invoices/1').send({
      amt: 500,
      paid: false
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      invoice: {
        id: 1,
        comp_code: 'code1',
        amt: 500,
        paid: false,
        add_date: expect.any(String),
        paid_date: null
      }
    });
  });
  test('It should return 404 for invalid invoice id', async () => {
    const resp = await request(app).put('/invoices/4').send({
      amt: 500
    });
    expect(resp.statusCode).toBe(404);
  });
  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/invoices/1")
        .send({});
    expect(response.status).toEqual(500);
  })
});

describe('DELETE /:id', () => {
  test('It should delete an existing invoice and return a message', async () => {
    const resp = await request(app).delete('/invoices/1');
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      status: 'deleted'
    });
  });
  test('It should return 404 for invalid invoice id', async () => {
    const resp = await request(app).delete('/invoices/4');
    expect(resp.statusCode).toBe(404);
  });
});