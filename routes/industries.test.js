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
  test('It should return an array of industries', async () => {
    const resp = await request(app).get('/industries');
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      industries: [
        {
          industry_code: 'code2',
          industry: 'Ind2',
          company_codes: [ null ]
        },
        {
          industry_code: 'code1',
          industry: 'Ind1',
          company_codes: [ null ]
        }
      ]
    });
  });
});

describe('POST /', () => {
  test('It should create a new industry and return that industry', async () => {
    const resp = await request(app).post('/industries').send({
      industry: 'Ind3'
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      industry: {
        code: 'ind3',
        industry: 'Ind3'
      }
    });
  });
});

describe('POST /:code', () => {
  test('It should add a new industry to a company and return that company', async () => {
    const resp = await request(app).post('/industries/code1').send({
      comp_code: 'code2'
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({ company_industry: { comp_code: 'code2', industry_code: 'code1' } });
  });
});
