
const Joi = require('joi');
const express = require('express');
var cors = require('cors')
const conn = require('./db/conn')
const app = express();
const PORT = (process.env.PORT || 5000);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth/Auth');
app.use(express.json());
app.use(cors())

const schema = Joi.object({
  f_Name: Joi.string().required(),
  l_Name: Joi.string().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required(),
});

const validateData = (data) => {
  return schema.validate(data);
};

app.post('/register', (req, res) => {
  let { f_Name, l_Name, username, email, password } = req.body
  const user = {
    email,
    password,
    username,
    f_Name,
    l_Name
  }
  const { error, value } = validateData(user);
  if (error) {
    return res.status(400).send({
      msg: error.details[0].message
    });
  }
  if (!username) {
    return res.status(400).send({
      msg: 'username should not be empty'
    });
  }
  conn.query(`SELECT * FROM users WHERE email=?`, email, (err, result) => {
    if (err) {
      return res.status(400).send({
        msg: err
      })
    }
    if (result.length !== 0) {
      return res.status(409).send({
        msg: 'This email is already in use!'
      });
    }
    bcrypt.hash(password, 8).then((hash) => {
      user.password = hash

    }).then(() => {
      conn.query("INSERT INTO users SET ?", user, (err, result) => {
        if (err) {
          return res.status(400).send({
            msg: err
          })
        }
        conn.query('SELECT * FROM users WHERE email=?', email, (err, result) => {
          if (err) {
            return res.status(400).send({
              msg: err
            })
          }
          return res.status(201)
            .send({
              userdata: user,
              msg: "successfully registered"
            })
        })

      })
    })
  });
})

app.post('/login', (req, res) => {
  const { email, password } = req.body

  if (req.body.email.trim() === '' || req.body.password.trim() === '') {
    return res.status(400).send({ msg: "email or password must not be empty" })

  }

  conn.query("SELECT * FROM users WHERE email=?", email, (err, result) => {
    if (err) {
      return res.status(400).send({
        msg: err
      })
    }
    //check whether the user with that email exists or not
    if (result.length === 0) {
      return res.status(401).send({
        msg: 'email or password is incorrect'
      })
    }
    //check password
    bcrypt.compare(password, result[0].password).then(isMatch => {
      if (isMatch === false) {
        return res.status(401).send({
          msg: "email or Password is incorrect "
        })
      }
      //generate token
      const token = jwt.sign({ id: result[0].user_id.toString() }, process.env.SECRET_KEY)
      return res.status(200).send({
        msg: "logged in successfully",
        user: result[0],
        token
      })

    })

  })
})

app.get('/get-user', auth, async (req, res) => {
  await conn.query('SELECT * FROM users WHERE email=?', req.body.email, (err, result) => {
    if (err) {
      return res.status(400).send({
        msg: err
      })
    }
    return res.status(201)
      .send({
        userdata: result,
        msg: "successfully details fetch sucessfully"
      })
  })
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})