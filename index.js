const express = require('express');
const ejs = require('ejs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Set up MongoDB connection
mongoose.connect('mongodb://localhost:27017/hodlinfo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Route to render the main.ejs file
app.get('/', (req, res) => {
  res.render('index');
});

// Define Mongoose schema for ticker data
const tickerSchema = new mongoose.Schema({
    base_unit: String,
  quote_unit: String,
  low: Number,
  high: Number,
  last: Number,
  type: String,
  open: Number,
  volume: Number,
  sell: Number,
  buy: Number,
  at: Number,
  name: String,
});

const TickerModel = mongoose.model('Ticker', tickerSchema);

// Fetch data from WazirX API and store in MongoDB
const fetchDataAndSave = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickersData = response.data;

    // Extract first ten tickers
    const firstTenTickers = Object.values(tickersData).slice(0, 10);

    // Save data to MongoDB
    await TickerModel.insertMany(firstTenTickers);
    console.log('First ten tickers saved to MongoDB');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Fetch data and save on server startup
fetchDataAndSave();





// Route to render the main.ejs file with data from MongoDB
// app.get("/", async (req, res) => {
//     try {
//         const data = await TrxinrModel.find({}).limit(10);
//         res.render("main", { data: data });
//     } catch (err) {
//         console.error("Error fetching data from MongoDB:", err);
//         res.status(500).send("Internal show error");
//     }
// });

app.get('/index', async (req, res) => {
    try {
        // Fetch data from MongoDB
        const data = await TickerModel.find({}).limit(10);
      
        // Log the fetched data
        console.log('Fetched data:', data);
      
        // Render the main.ejs template with the fetched data
        res.render('index', { data: data });
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});