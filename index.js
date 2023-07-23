
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;


const mongostring = process.env['mongostring'];
const uri = mongostring;


app.use(express.urlencoded({ extended: true }));

app.use(express.static('frontend'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

async function connectToDB() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    return client.db('user-auth'); 
    } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

app.get('/', (req, res) => {
  
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
 
});

app.post('/home', async (req, res) => {
  const { username, password } = req.body;
  const db = await connectToDB();
  const collection = db.collection('users');

  const user = await collection.findOne({ username });

  if (user && bcrypt.compareSync(password, user.password)) {
    
    res.render('home', { username });
   
  } else {
  
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

  
  const existingUser = await collection.findOne({ username });
  if (existingUser) {
    res.render('register', { errorMessage: 'Username already exists..!😐' });
    return;
  }

 
  const hashedPassword = bcrypt.hashSync(password, 10);

  
  await collection.insertOne({ username, password: hashedPassword });
  res.redirect('/');
});

const currentTime = new Date();

const currentHour = currentTime.getHours();
const currentMinute = currentTime.getMinutes();
const currentSecond = currentTime.getSeconds();





const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



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
