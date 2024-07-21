const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Configuration
const dbConfig = {
    user: 'sa',
    password: 'admin@123',
    server: 'localhost', // Replace with your SQL Server hostname or IP address
    database: 'employee_management', // Replace with your database name
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Connect to Database
sql.connect(dbConfig).then(pool => {
    if (pool.connecting) {
        console.log('Connecting to the database...');
    } else {
        console.log('Connected to the database!');
    }
}).catch(err => {
    console.error('Database connection failed:', err);
});

// Routes
// Get all employees
app.get('/api/employees', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Employees`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get an employee by ID
app.get('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM Employees WHERE id = ${id}`;
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Add a new employee
app.post('/api/employees', async (req, res) => {
    const { firstName, lastName, email, dob, gender, education, company, salary } = req.body;
    console.log(req.body);
    try {
        await sql.query`
            INSERT INTO Employees (firstName, lastName, email, dob, gender, education, company, salary)
            VALUES (${firstName}, ${lastName}, ${email}, ${dob}, ${gender}, ${education}, ${company}, ${salary})
        `;
        res.status(200).send('Employee added successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update an employee
app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, dob, gender, education, company, salary } = req.body;
    try {
        const result = await sql.query`
            UPDATE Employees
            SET firstName = ${firstName}, lastName = ${lastName}, email = ${email}, dob = ${dob}, gender = ${gender}, education = ${education}, company = ${company}, salary = ${salary}
            WHERE id = ${id}
        `;
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Employee updated successfully');
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete an employee
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`DELETE FROM Employees WHERE id = ${id}`;
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Employee deleted successfully');
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
