const express = require('express');
const app = express();
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xowczx7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        const partsCollection = client.db("pc_help").collection("parts");
        const orderCollection = client.db("pc_help").collection("orders");
        const reviewCollection = client.db("pc_help").collection("review");
        const usersCollection = client.db("pc_help").collection("users");


        /**API Naming Convention
         * ------------------------
         * app.get('/parts') get all parts
         * app.get('/parts/:id') get a single part for purchase
         */

        // get all parts
        app.get('/parts', async(req, res)=>{
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        })

        // get a single parts for purchase
        app.get('/parts/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const part = await partsCollection.findOne(query);
            res.send(part);
        })
        
        
        // post a order from client
        app.post('/order', async(req, res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        // get user orders
        app.get('/order', async(req, res)=>{
            const email = req.query.email;
            const query = {email:email};
            const order = await orderCollection.find(query).toArray();
            res.send(order)
        })

        // post a review form client
        app.post('/review', async(req, res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        // get the review from mongodb
        app.get('/review', async(req, res)=>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // put the user
        app.put('/user/:email', async(req, res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email:email};
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
              };
              const result = await usersCollection.updateOne(filter, updateDoc, options);
              const token =jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRETE, {expiresIn: '1h'})
              res.send({result,token})
        })

        // put the user admin
        // app.put('/users/admin/:email', async(req, res)=>{
        //     const email = req.params.email;
        //     const filter = {email:email};
        //     const updateDoc = {
        //         $set: {role: 'admin'},
        //       };
        //       const result = await usersCollection.updateOne(filter, updateDoc);
        //       res.send(result)
        // })


        // -----------------------------
        app.put("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            const filter = {email:email};
            const updateDoc = {
                $set: {role: 'admin'},
              };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.send(result)
          });
        // -----------------------------


        // get all users from database
        app.get('/users', async(req, res)=>{
            const query = {};
            const cursor = usersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

    }
    finally {

    }

}



run().catch(console.dir);
// --------------------------------------------------------
app.get('/', (req, res) => {
    res.send('Hello From PC help!')
})

app.listen(port, () => {
    console.log(`PC help app listening on port ${port}`)
})