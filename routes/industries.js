const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');
const slugify = require("slugify");

router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT industries.code AS industry_code, industries.industry, array_agg(comp_code) AS company_codes
      FROM industries
      LEFT JOIN companies_industries ON industries.code = companies_industries.industry_code
      GROUP BY industries.code, industries.industry
    `;
    const industriesResult = await db.query(query);
    return res.json({ industries: industriesResult.rows });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { industry } = req.body;
    const code = slugify(industry, { lower: true });
    const result = await db.query(
      `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { comp_code } = req.body;
    const result = await db.query(
      `INSERT INTO companies_industries (comp_code, industry_code) VALUES ($1, $2) RETURNING comp_code, industry_code`,
      [comp_code, code]
    );
    return res.status(201).json({ company_industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;