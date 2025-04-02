const express = require('express')
const router = express.Router();

const Pool = require('pg').Pool 
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'database-postgres-2-lab04',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });

router.get('/', (req, res) => {
    console.log("Get...pe backend..,,,,,,\n");
    pool.query('SELECT * FROM tasks ORDER BY created_at DESC', (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).json(results.rows);
      })
});

router.post('/', (req, res) => {
    const { description } = req.body
    console.log("POST...pe backend..", req.body,",,,,,,\n");

    pool.query('INSERT INTO tasks (description) VALUES ($1)', [description], (error, results) => {
        if (error) {
          throw error;
        }

        res.status(200).send({
          result: "Task successfully added."
        });
    });
});

router.put('/:task_id', (req, res) => {
    const task_id = parseInt(req.params.task_id)
    console.log("PUT TASK ...pe backend..", task_id,",,,,,,\n");
    const { status } = req.body
    pool.query('UPDATE tasks SET status = $1 WHERE task_id = $2', [status, task_id], (error, results) => {
        if (error) {
            throw error
        }

        res.status(200).send(
          {
            result: "Task status was modified."
          });
    })
});

module.exports = router;