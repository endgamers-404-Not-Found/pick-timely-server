const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const nodemailer = require('nodemailer');


// const nodemailer = require('nodemailer');


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { response } = require('express');
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// const nodemailer = require('nodemailer');



app.use(cors())
app.use(express.json());








// console.log(diffesrenceOfTime("19:50"));




const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "notfound404.picktimely@gmail.com",
    pass: "uzunpmoxinphglaz"
  }
});
const transporter1 = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "notfound404.picktimely@gmail.com",
    pass: "uzunpmoxinphglaz"
  }
});




function sendScheduleMail(schedule) {
  const { timeSlot, name, email, description, dateFormat } = schedule;
  const e = email.map(email => email.email);

  const mailOptons = {
    from: "notfound404.picktimely@gmail.com",
    to: e,
    subject: `Your interview  ${description} for  on  at  is confirmed`,
    text: `We are inviting you from schedulemeeting ltd ${dateFormat}`,
    html: `
        <div> 
          <p>Hello, ${name},</p>
          <h4>You are selected for online interview ${description}</h4>
          <h4>Your interview  for  is confirmed ${dateFormat}</h4>
          <h4>Looking forward to see you on at ${timeSlot} </h4>
          <p>Join this link  <a href="https://meet.google.com/cyw-kcbs-oya?pli=1&authuser=0">Meeting</a>  </p>
          <p>Sincerely</p>
          <p>Are you interested for meeting?</p>
          <button>Yes</button>
          <button>No</button>
          <p>Not Found  Pvt. Ltd. </p>
          <h4 className="mt-5">Our Address</h4>
          <p>Not-found ,Dhaka</p>
          <p>Bangladesh</p>     
       
        </div>
      `
  };



  transporter.sendMail(mailOptons, function (err, data) {
    if (err) {
      console.log('something is wrong', err);
    } else {
      console.log('Email sent', data);
    }
  });

}


const today = new Date();

const date = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
const time = today.getHours() + ":" + today.getMinutes();
console.log(date);
console.log(time);

/* const request = require('request');
request('https://pick-timely.herokuapp.com/schedule', function (error, response, body) {
  console.error('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
 // Print the HTML for the Google homepage.
// console.log(body) 

})  */










function remainderSchedule(schedule) {
  console.log("hello from remainder");
  const { timeSlot, name, email, description, dateFormat } = schedule;


  console.log(timeSlot, dateFormat);

  const e = email.map(email => email.email)
  const mailOptons = {
    from: "notfound404.picktimely@gmail.com",
    to: e,
    subject: `Remainder interview  ${description} for  on  at  is confirmed`,
    text: `We are inviting you from schedulemeeting ltd ${dateFormat}`,
    html: `
          <div> 
            <p>Hello, ${name},</p>
            <h4>You are not selected for online interview ${description}</h4>
            <h4>Your interview  for  is confirmed ${dateFormat}</h4>
            <h4>Looking forward to see you on at ${timeSlot} </h4>
            <p>Join this link  <a href="https://meet.google.com/cyw-kcbs-oya?pli=1&authuser=0">Meeting</a>  </p>
            <p>Sincerely</p>
            <p>Not Found  Pvt. Ltd. </p>
            <h4 className="mt-5">Our Address</h4>
            <p>Not-found ,Dhaka</p>
            <p>Bangladesh</p>     
         
          </div>
        `
  };
  transporter1.sendMail(mailOptons, function (err, data) {
    if (err) {
      console.log('something is wrong', err);
    } else {
      console.log('Email sent', data);
    }
  })


}
const differenceOfTime = (previousTime) => {
  const currentTime = (parseInt(time.slice(0, 2)) * 60) + parseInt(time.slice(3, 5));
  const previousTime1 = (parseInt(previousTime.slice(0, 2)) * 60) + parseInt(previousTime.slice(3, 5));
  return previousTime1 - currentTime;
}
console.log(differenceOfTime("10:20"))

function remainder(schedule) {
  remainderSchedule(schedule)
}





app.get('/', (req, res) => {
  res.send('server running')
})




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




    //post a new user
    app.post('/addUser', verifyJWT, async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const result = await userCollection.insertOne({ name, email })
      res.send(result)
    })


    //get all the package
    app.get('/packages', async (req, res) => {
      const packages = await Packages.find().toArray()
      res.send(packages)
    })

    app.get('/package/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Packages.findOne(query);
      res.send(result)
    })


    // load all user 
    app.get("/allUser", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    });

    app.get("/allUser/:email", async (req, res) => {
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

    //hoster update
    app.put('/hoster/:id', async (req, res) => {
      const id = req.params.id;
      const hoster = req.body;
      const filtered = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          hoster: hoster.hoster,
          email: hoster.email,
          duration: hoster.duration,
          eventType: hoster.eventType,
          description: hoster.description,
          image: hoster.image,
        }
      };
      const result = await hostCollection.updateOne(filtered, updatedDoc, options);
      res.send(result);
    })

    app.get('/hoster/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await hostCollection.findOne(query);
      res.send(result);
    });

    app.delete('/hoster/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await hostCollection.deleteOne(query);
      res.send(result);
    });



    app.get("/schedule/dateWise", async (req, res) => {
      const date = req.query.dateFormat;
      const today = new Date();
      const day = today.toLocaleDateString();
      console.log(date);
      if (date === day) {
        const query = parseInt({ dateFormat: date });
        const result = await meetingCollection.find(query).toArray();
        return res.send(result);
      } else {

        return res.send('<h1>No schedule available</h1>');
      }
    });

    app.put('/schedule/:id', async (req, res) => {
      const id = req.params.id;
      const schedule = req.body;
      const filtered = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          timeSlot: schedule.timeSlot,
          name: schedule.name,
          email: schedule.email,
          description: schedule.description,
          dateFormat: schedule.dateFormat,
        }
      };
      const result = await meetingCollection.updateOne(filtered, updatedDoc, options);
      res.send(result);
    })

    app.get("/schedule/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await meetingCollection.findOne(query);
      res.send(result);
    });

    app.get("/schedule/dateSchedule", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await meetingCollection.findOne(query);
      res.send(result);
    });


    app.post('/schedule', async (req, res) => {
      const schedule = req.body;
      const result = await meetingCollection.insertOne(schedule);
      sendScheduleMail(schedule);
     
      const diff = 86400000;
      setTimeout(remainder, diff, schedule)


      // remainder()
      res.send(result);
    });


    app.delete("/schedule/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await meetingCollection.deleteOne(query);
      res.send(result)
    });



    app.post('/schedule', async (req, res) => {
      const newSchedule = req.body;
      const { email, dateFormat } = newSchedule
      const result = await meetingCollection.insertOne(newSchedule);
      console.log(email, dateFormat)

      res.send(result);
    });

    app.get("/schedule", async (req, res) => {


      const result = await meetingCollection.find().toArray();
      res.send(result)
    });

    app.get("/schedule/reminder", async (req, res) => {
      const result = await meetingCollection.find().toArray();
      remainderSchedule(result)
      res.send(result)
    });



    app.get("/scheduleList", async (req, res) => {

      const newSchedule = req.body;
      const { email, dateFormat } = newSchedule

      const result = await meetingCollection.find({ date: dateFormat }).toArray();
      console.log(result)
      res.send(result);


    })








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

    app.get('/customers', async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })

  }

  finally {
    // client.close();
  }


  // basic server
  app.get('/', async (req, res) => {
    res.send('server running')
  })




  app.listen(port, () => {
    console.log('server running on the port ', port);
  })

}

run().catch(console.dir)





