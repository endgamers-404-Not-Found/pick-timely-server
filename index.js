const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.Name}:${process.env.Pass}@cluster0.sbqudjz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        await client.connect();
        const userCollection = client.db("Pick-Timely").collection("userCollection");
        const Packages = client.db("Pick-Timely").collection("Packages");
        const profileCollection = client.db("Profile").collection("profileCollection")

        // basic server
        app.get('/', async (req, res) => {
            res.send('server running')
        })


        //post a new user
        app.post('/addUser', async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const result = await userCollection.insertOne({ name, email })
            res.send(result)
        })


        //get all packages
        app.get("/packages", async (req, res) => {
            const result = await Packages.find().toArray();
            res.send(result)
        });

        //updating users profile
        app.put('/update/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const profile = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: profile,
            };
            const result = await profileCollection.updateOne(filter, updateDoc, options);
            res.send({ success: true, result });
        });

         //get profile data.
        app.get('/profile/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await profileCollection.find(query).toArray();
            res.send(result);
        });
    }

    finally {
        // client.close();
    }





    app.listen(port, () => {
        console.log('server running on the port ', port);
    })

}




run().catch(console.dir)