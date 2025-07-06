require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@cluster0.xytbufb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    console.log('MongoDB: Connected successfully!');
    
    const db = client.db('expenseDB');
    const expenseCollection = db.collection('expenses');


    app.get('/', (req, res) => {
      res.send('API is running. MongoDB is connected.');
    });


    app.get('/expenses', async (req, res) => {
      const expenses = await expenseCollection.find().toArray();
      res.json(expenses);
    });


    app.post('/expenses', async (req, res) => {
      const expense = req.body;
      const result = await expenseCollection.insertOne(expense);
      res.status(201).json(result);
    });

    
    app.delete('/expenses/:id', async (req, res) => {
      const id = req.params.id;
      const result = await expenseCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });
    

  app.put('/expenses/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;

    try {
      const result = await expenseCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      res.json({ message: 'Expense updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  });


    app.listen(port, () => {
      console.log(` Server: Running at http://localhost:${port}`);
      console.log(`API Endpoint: GET http://localhost:${port}/expenses`);
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

run();
