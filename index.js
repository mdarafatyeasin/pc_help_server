const express = require('express');
const app = express();
const cors = require('cors');
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