const express = require("express");
const app = express();
require("dotenv/config");
const cors = require("cors");
const {Pool} = require("pg");
const {check,validationResult} = require("express-validator");
const port = process.env.PORT || 8000;

const pool = new Pool({connectionString:process.env.ELEPHANT_SQL_CONNECTION_STRING});
app.use(express.json());
app.use(cors());

const validateRequestBody = [
    check("title").isString(),
    check("director").isString(),
    check("year").isInt(),
    check("rating").isInt(),
    check("poster").isString(),
    check("trailer").isString(),
    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }
        next();
    }
];

app.get("/",(req,res)=>{
    res.send("Hello Project");
})

app.get("/api/movies",(req,res)=>{
    pool.query("SELECT * FROM movies;").then(data=>{
        res.json(data.rows);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    });
})

app.get("/api/movies/:id",(req,res)=>{
    const id = req.params.id;
    pool.query("SELECT * FROM movies WHERE id=$1;",[id]).then(data=>{
        res.json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    });
})

app.post("/api/movies",validateRequestBody,(req,res)=>{
    const {title,director,year,rating,poster,trailer} = req.body;
    pool.query("INSERT INTO movies (title,director,year,rating,poster,trailer) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;",[title,director,year,rating,poster,trailer]).then(data=>{
        res.status(201).json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    });


})







app.listen(port, ()=>console.log(`Server listening on port ${port}`));