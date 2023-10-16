const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');
const slugify = require("slugify");

router.get('/', async (req, res, next) => {
	try {
		const result = await db.query(`SELECT code, name FROM companies`);
		return res.json({ companies: result.rows });
	} catch (err) {
		return next(err);
	}
});

router.get('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
    const companyResult = await db.query(
      `SELECT code, name, description FROM companies WHERE code=$1`,
      [code]
    );
    if (companyResult.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    const invoiceResult = await db.query(
      `SELECT id FROM invoices WHERE comp_code=$1`,
      [code]
    );
    const industryResult = await db.query(
      `SELECT industry FROM industries AS i INNER JOIN companies_industries AS ci ON i.code=ci.industry_code WHERE ci.comp_code=$1`,
      [code]
    );
    const company = companyResult.rows[0];
    const invoices = invoiceResult.rows;
    const industries = industryResult.rows.map(ind => ind.industry);
    company.invoices = invoices.map(inv => inv.id);
    company.industries = industries;
    return res.json({ "company": company });
	} catch (err) {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;
    const code = slugify(name, { lower: true });
		const result = await db.query(
			`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
			[code, name, description]
		);
    return res.status(201).json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
      [name, description, code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      `DELETE FROM companies WHERE code=$1 RETURNING code`,
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't delete company with code of ${code}`, 404);
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;