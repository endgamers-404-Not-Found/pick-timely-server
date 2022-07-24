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
 
try {
    client.connect();
    const userCollection = client.db("Pick-Timely").collection("userCollection");

    //post a new user
    app.post('/addUser',async(req,res)=>{
        const name = req.body.name;
        const email = req.body.email;
        const result = await userCollection.insertOne({name,email})
        res.send(result)
    })

} 
catch {
    // client.close();
}




//basic server
app.get('/',(req,res)=>{
    res.send('server running')
})



app.listen(port,()=>{
    console.log(`server running on the port `,port)
})