const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
//middleware

app.get("/", (req, res) => {
  res.send("welcome to coffee shop");
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.aunb3y8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const coffeesCollection = client.db("coffeesDB").collection("coffees");

    //find all
    app.get("/coffees", async (req, res) => {
      const cursor = coffeesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //single item create
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeesCollection.insertOne(newCoffee);
      res.send(result);
    });

    //find single item by id
    app.get("/coffee/:id", async (req, res) => {
      const coffeeId = req.params.id;
      const params = { _id: new ObjectId(coffeeId) };
      const result = await coffeesCollection.findOne(params);
      res.send(result);
    });

    //delete single item by id
    app.delete("/coffee/:id", async (req, res) => {
      const deleteId = req.params.id;
      const query = { _id: new ObjectId(deleteId) };
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    });

    //update single item
    app.put("/coffee/:id", async (req, res) => {
      const updateId = req.params.id;
      const filter = { _id: new ObjectId(updateId) };
      const options = { upsert: true };
      const updatedCoffee = req.body;

      const coffee = {
        $set: {
          name: updatedCoffee.name,
          chef: updatedCoffee.chef,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
          price: updatedCoffee.price,
        },
      };
      const result = await coffeesCollection.updateOne(filter, coffee, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
