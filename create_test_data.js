process.env.NODE_ENV === 'test';

const db = require('./db');
const fs = require('fs');

async function createData() {
	const dbSetupScript = fs.readFileSync('data.sql', 'utf8');
	await db.query(dbSetupScript);

	await db.query('DELETE FROM invoices');
	await db.query('DELETE FROM companies');
	await db.query("SELECT setval('invoices_id_seq', 1, false)");

	await db.query(`INSERT INTO companies (code, name, description)
                    VALUES ('code1', 'Comp1', 'Decscription1'),
                           ('code2', 'Comp2', 'Decscription2')`);

	const inv = await db.query(
		`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
           VALUES ('code1', 100, false, '2021-01-01', null),
                  ('code2', 200, true, '2022-02-02', '2022-02-03'), 
                  ('code2', 300, false, '2023-03-03', null)
           RETURNING id`
	);
}

module.exports = { createData };
