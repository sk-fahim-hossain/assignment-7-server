const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const objectId = require("mongodb").ObjectId;
const cors = require("cors");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;



//middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.if4agm4.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const donationsCategory = client.db("donation-db").collection("donations-category");

        app.get("/", (req, res) => {
            res.send("Donation Server is Running");
        });

        // donations api
        app.get("/donations", async (req, res) => {
            console.log(req.body)
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
            try {
                const { title, category, amount, description, moneyCollected } = req.body;
                const dId = req.params.id;
        
                // Input validation if necessary
                
                const filter = { _id: new ObjectId(dId) }; // Ensure ObjectId is properly used
                const updateDoc = {
                    $set: {
                        title,
                        category,
                        amount,
                        description,
                        moneyCollected
                    }
                };
        
                const options = { upsert: true , new: true};
        
                const result = await donationsCategory.findOneAndUpdate(filter, updateDoc, options);
        
                
                
                // Check if the document was found and updated
                if (result.matchedCount > 0) {
                    res.status(200).send({ message: "Document updated successfully" });
                } else {
                    res.status(404).send({ message: "Document not found" });
                }
            } catch (error) {
                console.error("Error updating document:", error);
                res.status(500).send({ message: "Internal server error" });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});