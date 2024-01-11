const express = require("express");
const app = express();
require("dotenv/config");
const cors = require("cors");
const {Pool} = require("pg");
const {check,validationResult,oneOf} = require("express-validator");
const port = process.env.PORT || 8000;

const pool = new Pool({connectionString:process.env.ELEPHANT_SQL_CONNECTION_STRING});
app.use(express.json());
app.use(cors());

const validateRequestBody = [
    check("title").isString(),
    check("director").isString(),
    check("year").isInt(),
    check("rating").isInt(),
    check("genre").isString(),
    check("description").isString(),
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

const validateField = [
    oneOf([
        check("title").exists(),
        check("director").exists(),
        check("year").exists(),
        check("rating").exists(),
        check("genre").exists(),
        check("description").exists(),
        check("poster").exists(),
        check("trailer").exists(),]),
        (req,res,next)=>{
            const errors = validationResult(req);
            if(!errors.isEmpty())
            {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    
]



const checkValidId = (req,res,next)=>{
    const id = req.params.id;
    pool.query("SELECT * FROM movies WHERE id = $1;",[id]).then(data=>data.rows.length>0?next():res.status(404).send("Movie not found")).catch(e=>{
        res.status(500).json({message:e.message});
    })
}

app.get("/",(req,res)=>{
    res.send("Hello Project");
})

app.get("/api/movies",(req,res)=>{
  if(req.query.title)
  {const query = "%" +req.query.title +"%";
      pool.query("SELECT * FROM movies WHERE title ILIKE $1;",[query]).then(data=>{
          res.json(data.rows);
      }).catch(e=>{
          res.status(500).json({message:e.message});
      })
  }
  else{
    pool
      .query("SELECT * FROM movies;")
      .then((data) => {
        res.json(data.rows);
      })
      .catch((e) => {
        res.status(500).json({ message: e.message });
      });

  }
    
})

app.get("/api/movies/:id",checkValidId,(req,res)=>{
    const id = req.params.id;
    pool.query("SELECT * FROM movies WHERE id=$1;",[id]).then(data=>{
        res.json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    });
})

app.post("/api/movies",validateRequestBody,(req,res)=>{
    const {title,director,year,rating,genre,description,poster,trailer} = req.body;
    pool.query("INSERT INTO movies (title,director,year,rating,poster,trailer,genre,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;",[title,director,year,rating,poster,trailer,genre,description]).then(data=>{
        res.status(201).json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    });


})

app.put("/api/movies/:id",checkValidId,validateField,(req,res)=>{
    
    if(req.body.title)
    {
        pool.query("UPDATE movies SET title=$1 WHERE id=$2 RETURNING *;",[req.body.title,req.params.id]).then(data=>{
            res.status(201).json(data.rows[0]);
        }).catch(e=>{
            res.status(500).json({message:e.message});
        })
    }
    else if(req.body.director)
    {
        pool
          .query("UPDATE movies SET director=$1 WHERE id=$2 RETURNING *;", [
            req.body.director,
            req.params.id,
          ])
          .then((data) => {
            res.status(201).json(data.rows[0]);
          })
          .catch((e) => {
            res.status(500).json({ message: e.message });
          });

    }
    else if(req.body.year)
    {
        pool
          .query("UPDATE movies SET year=$1 WHERE id=$2 RETURNING *;", [
            req.body.year,
            req.params.id,
          ])
          .then((data) => {
            res.status(201).json(data.rows[0]);
          })
          .catch((e) => {
            res.status(500).json({ message: e.message });
          });

    }
    else if(req.body.rating)
    {
        pool
          .query("UPDATE movies SET rating=$1 WHERE id=$2 RETURNING *;", [
            req.body.rating,
            req.params.id,
          ])
          .then((data) => {
            res.status(201).json(data.rows[0]);
          })
          .catch((e) => {
            res.status(500).json({ message: e.message });
          });

    }
    else if(req.body.poster)
    {
        pool
          .query("UPDATE movies SET poster=$1 WHERE id=$2 RETURNING *;", [
            req.body.poster,
            req.params.id,
          ])
          .then((data) => {
            res.status(201).json(data.rows[0]);
          })
          .catch((e) => {
            res.status(500).json({ message: e.message });
          });

    }
    else if (req.body.trailer)
    {
        pool
          .query("UPDATE movies SET trailer=$1 WHERE id=$2 RETURNING *;", [
            req.body.trailer,
            req.params.id,
          ])
          .then((data) => {
            res.status(201).json(data.rows[0]);
          })
          .catch((e) => {
            res.status(500).json({ message: e.message });
          });

    }
    else if(req.body.genre)
    {
      pool
        .query("UPDATE movies SET genre=$1 WHERE id=$2 RETURNING *;", [
          req.body.genre,
          req.params.id,
        ])
        .then((data) => {
          res.status(201).json(data.rows[0]);
        })
        .catch((e) => {
          res.status(500).json({ message: e.message });
        });
    }
    else if (req.body.description)
    {
       pool
         .query("UPDATE movies SET description=$1 WHERE id=$2 RETURNING *;", [
           req.body.description,
           req.params.id,
         ])
         .then((data) => {
           res.status(201).json(data.rows[0]);
         })
         .catch((e) => {
           res.status(500).json({ message: e.message });
         });
    }
})

app.delete("/api/movies/:id",checkValidId,(req,res)=>{
  pool.query("DELETE FROM movies WHERE id=$1 RETURNING *;",[req.params.id]).then(data=>{
    res.status(201).json(data.rows[0]);
  }).catch(e=>{
    res.status(500).json({message:e.message});
  })
})







app.listen(port, ()=>console.log(`Server listening on port ${port}`));