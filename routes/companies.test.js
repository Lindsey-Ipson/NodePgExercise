const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { createData } = require('../create_test_data');

beforeEach(createData);

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
	await db.end();
});

describe('GET /', () => {
	test('It should return an array of companies', async () => {
		const resp = await request(app).get('/companies');
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
		  companies: [
		    { code: 'code1', name: 'Comp1' },
		    { code: 'code2', name: 'Comp2' }
		  ]
		});
	});
});

describe('GET /:code', () => {
  test('It should return a single company corresponding to code in parameter', async () => {
    const resp = await request(app).get('/companies/code1');
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      "company": {
        code: 'code1',
        name: 'Comp1',
        description: 'Decscription1',
        invoices: [1]
      }
    });
  });
  test('It should return 404 for invalid company code', async () => {
    const resp = await request(app).get('/companies/code3');
    expect(resp.statusCode).toBe(404);
  });
});

describe('POST /', () => {
  test('It should create a new company and return that company', async () => {
    const resp = await request(app).post('/companies').send({
      code: 'code3',
      name: 'Comp3',
      description: 'Decscription3'
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      company: {
        code: 'code3',
        name: 'Comp3',
        description: 'Decscription3'
      }
    });
  });
  test("It should return 500 for attempted duplicate names", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Comp1", description: "Another description"});
    expect(response.status).toEqual(500);
  });
  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .post("/companies")
        .send({});
    expect(response.status).toEqual(500);
  })
});

describe('PUT /:code', () => {
  test('It should update a company and return that company', async () => {
    const resp = await request(app).put('/companies/code1').send({
      name: 'Comp1a',
      description: 'Decscription1a'
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      company: {
        code: 'code1',
        name: 'Comp1a',
        description: 'Decscription1a'
      }
    });
  });
  test('It should return 404 for invalid company code', async () => {
    const resp = await request(app).put('/companies/code3').send({
      name: 'Comp3',
      description: 'Decscription3'
    });
    expect(resp.statusCode).toBe(404);
  });
  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/companies/code1")
        .send({});
    expect(response.status).toEqual(500);
  })
});

describe('DELETE /:code', () => {
  test('It should delete a company and return a message', async () => {
    const resp = await request(app).delete('/companies/code1');
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ status: 'deleted' });
  });
  test('It should return 404 for invalid company code', async () => {
    const resp = await request(app).delete('/companies/code3');
    expect(resp.statusCode).toBe(404);
  });
});

