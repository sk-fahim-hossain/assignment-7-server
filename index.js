const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.if4agm4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;




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

        const donationsCategory = client.db("donation-db").collection("donations-category");

        app.get("/donations", async (req, res) => {
            const cursor = donationsCategory.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/donations/:id", async (req, res) => {
            const categoryId = req.params.id;
            const query = { _id: new ObjectId(categoryId) };
            const result = await donationsCategory.findOne(query);
            res.send(result);
        });


        app.post("/donations", async (req, res) => {
            const newPost = req.body;
            const result = await donationsCategory.insertOne(newPost);
            res.send(result);
        });

        app.delete("/donations/:id", async (req, res) => {
            const dId = req.params.id;
            const query = { _id: new ObjectId(dId) };
            const result = await donationsCategory.deleteOne(query);
            res.send(result);
        });



        app.put("/donations/:id", async (req, res) => {

            const { title, category, amount, description, moneyCollected } = req.body;
            const dId = req.params.id;

            const filter = { _id: new ObjectId(dId) };
            const updateDoc = {
                $set: {
                    title,
                    category,
                    amount,
                    description,
                    moneyCollected
                }
            };

            const options = { upsert: true, new: true };
            const result = await donationsCategory.findOneAndUpdate(filter, updateDoc, options);

            if (result.matchedCount > 0) {
                res.status(200).send({ message: "Document updated successfully" });
            } else {
                res.status(404).send({ message: "Document not found" });
            }

        });


        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {


    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Donation server')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});