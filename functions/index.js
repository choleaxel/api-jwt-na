import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mySecretKey from "./secret.js";

const users = [
  {
    id: 1,
    email: "todd@bocacode.com",
    password: "$2b$10$P3aXGrZDKJftU6NwMDOYuuZxz.4xEWK1B0CdnTXN.bzXD05Cy.3w6",
  },
  {
    id: 2,
    email: "damian@bocacode.com",
    password: "$2b$10$P3aXGrZDKJftU6NwMDOYuuKZOIjHYyUpb/QxMcBWsl5fzlLdqLHvW",
  },
  {
    id: 3,
    email: "vitoria@bocacode.com",
    password: "$2b$10$P3aXGrZDKJftU6NwMDOYuuQ.Os7qLSOvZL3K.8MRfKSK/aA7aB29m",
  },
]; //creating users for our db to test, fake db, this is where the db.collection
// would be
//added salt to the passwords and got the hashed password

const app = express();
app.use(cors());
app.use(express.json());

//routes
app.post("/login", (req, res) => {
  const { email, password } = req.body; //getting email and pswd from the body
  //check to see if that email and pswd exist in our db
  //if they do, create and send back a token
  //if they don't, send back an error
  let user = users.find(
    (user) => user.email === email && user.password === password
  ); //do both email and pswd match?
  if (!user) {
    res.status(401).send({ error: "Invalid email or password" });
    return;
  }
  user.password = undefined; //remove pswd from user object
  //now we want to create and sign a token...
  const token = jwt.sign(user, mySecretKey, { expiresIn: "1h" });
  res.send({ token }); //sending the token back
});
app.get("/public", (req, res) => {
  res.send({ message: "Welcome!" });
});
app.get("/private", (req, res) => {
  //let's require a valid token to see this
  const token = req.headers.authorization || "";
  if (!token) {
    //if no token send error
    res.status(401).send({ error: "You must be logged in to see this" });
    return;
  }
  jwt.verify(token, mySecretKey, (err, decoded) => {
    if (err) {
      res.status(401).send({ error: "You must use a valid token to see this" });
      return;
    }
    //here we know that the token is valid
    res.send({ message: `Welcome ${decoded.email}!` });
  });
});
//now we can use in postman to get token in a 'get', http://localhost:5050/

export const api = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
