const express = require('express');
const cors = require('cors');
const SendinBlueApi = require('sendinblue-apiv3');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const nodemailer = require('nodemailer');


app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('server running')
})

const defaultClient = SendinBlueApi.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;
 

const api = new SendinBlueApi.AccountApi()
api.getAccount().then(function(data) {
  console.log('API called successfully. Returned data: ' + data);
}, function(error) {
  console.error(error);
});
 




//use token

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'Unauthorization access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next()
    });
  }

const uri = `mongodb+srv://${process.env.Name}:${process.env.Pass}@cluster0.sbqudjz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        await client.connect();
        const userCollection = client.db("Pick-Timely").collection("userCollection");
        const Packages = client.db("Pick-Timely").collection("Packages");
        const hostCollection = client.db("Pick-Timely").collection("hoster");
        const meetingCollection = client.db("Pick-Timely").collection("meetingSchedule");
        const reviewCollection = client.db("Pick-Timely").collection("userReviews")


        // basic server
        app.get('/', async (req, res) => {
            res.send('server running')
        })


        //post a new user
        app.post('/addUser',verifyJWT, async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const result = await userCollection.insertOne({ name, email })
            res.send(result)
        })

        // load all user 
        app.get("/allUser",async(req, res)=>{
            const result = await userCollection.find().toArray();
            res.send(result)
        });



        // admin role api 
        app.put('/allUser/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' }
              };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
          })

          app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
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
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send({ success: true, result });
        });

        //get profile data.
        app.get('/profile/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        });



        //get a package by id
        app.get('/package/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await Packages.findOne(query)
            res.send(result);
        })


        //create a payment intent
        app.post('/createPaymentIntent', async (req, res) => {
            const { price } = req.body;
            // console.log(cost)
            const amount = parseInt(price) * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({ clientSecret: paymentIntent.client_secret })
        })


        //update user data after payment
        //update after payment
        app.put('/payment/:email', async (req, res) => {
            const email = req.params.email;
            const stripeReturn = req.body.paymentIntent;
            const price = req.body.price;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    transactionId: `${stripeReturn.id}`, status: `${price === 130 ? 'corporate' : 'team'}`
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        //get Host data
        app.get("/hoster", async (req, res) => {
            const result = await hostCollection.find().toArray();
            res.send(result)
        });

        app.post('/hoster', async (req, res) => {
            const newSchedule = req.body;
            const result = await hostCollection.insertOne(newSchedule);
            res.send(result);
        });

        app.get('/hoster/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await hostCollection.findOne(query);
            res.send(result);
        });

        app.post('/schedule', async (req, res) => {
            const newSchedule = req.body;
            const {email,dateFormat}=newSchedule
            const result = await meetingCollection.insertOne(newSchedule);
            console.log(email,dateFormat)
      
            res.send(result);
        });

        app.get("/schedule", async (req, res) => {
            const result = await meetingCollection.find().toArray();
            console.log(result)
            res.send(result)
        });



        app.get("/scheduleList", async (req, res) => {
            
            const newSchedule = req.body;
            const {email,dateFormat}=newSchedule
          
            const result = await meetingCollection.find({ date:dateFormat });
            console.log(result)
            res.send(result);


        })

        //send email






        // all of review api
        // post api for review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/review', async (req, res) => {
            const query = {};
            const result = await reviewCollection.find(query).toArray();
            res.send(result)
        })



    }

    finally {
        // client.close();
    }





    app.listen(port, () => {
        console.log('server running on the port ', port);
    })

}




run().catch(console.dir)

