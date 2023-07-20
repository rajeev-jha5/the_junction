// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Replace the following with your MongoDB connection string from Atlas
const mongostring = process.env['mongostring'];
const uri = mongostring;

app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('frontend'));

// EJS template engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

async function connectToDB() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    return client.db('user-auth'); // Replace 'your_database_name' with your actual database name
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

app.get('/', (req, res) => {
  // res.render('login', { errorMessage: null });
  res.redirect('/login');
});//if url / then redirect to loginpage

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
  // res.redirect('/login');
});

app.post('/home', async (req, res) => {
  const { username, password } = req.body;
  const db = await connectToDB();
  const collection = db.collection('users');

  const user = await collection.findOne({ username });

  if (user && bcrypt.compareSync(password, user.password)) {
    // Authentication successful
    res.render('home', { username });
    // res.redirect('/home');
    // console.log(loggedin);
  } else {
    // Authentication failed
    res.render('login', { errorMessage: 'Invalid credentials. Please try again.😥' });    
  }
});

app.get('/home', (req,res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register', { errorMessage: null });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const db = await connectToDB();
  const collection = db.collection('users');

  // Check if the username already exists in the database
  const existingUser = await collection.findOne({ username });
  if (existingUser) {
    res.render('register', { errorMessage: 'Username already exists..!😐' });
    return;
  }

  // Hash the password before saving it to the database
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Save the new user to the database
  await collection.insertOne({ username, password: hashedPassword });
  res.redirect('/');
});

const currentTime = new Date();

const currentHour = currentTime.getHours();
const currentMinute = currentTime.getMinutes();
const currentSecond = currentTime.getSeconds();





const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket server logic

wss.on('connection', (ws) => {
    console.log("One client Connected");
    ws.on("close",()=>{
        console.log("One Client Disconnected");
    });

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
      console.log();
      console.log(`Current time: ${currentHour}:${currentMinute}:${currentSecond}.....${JSON.stringify(parsedMessage)}`);


        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(parsedMessage));
            }
        });
    });
});


server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
