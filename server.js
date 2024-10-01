const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
// app.use(cors());

// Use the CORS middleware
app.use(cors({
  origin: '*' // or use '*' to allow all origins
}));


app.use(bodyParser.json());

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://omarvenom22:JPZ4jK7U8zECbbxB@cluster0.p3oak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes


const sarahaRoutes = require('./routes/Saraha');
app.use('/saraha', sarahaRoutes);






// Create HTTP Server
const server = http.createServer(app);


// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
