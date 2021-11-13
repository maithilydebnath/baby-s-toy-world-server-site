const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId= require ('mongodb').ObjectId;

const cors = require('cors');
// const admin = require("firebase-admin");
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3eohd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try{
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('toys_world');
        const productsCollection = database.collection('products');
        const purchaseCollection = database.collection('purchase');
        const reviewCollection = database.collection('review');
        const usersCollection = database.collection('users');

    //   Get all products Toy
        app.get('/products', async(req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
          })

        // Add Product
        app.post('/products', async (req, res) => {
        const product= req.body;
        const result = await productsCollection.insertOne(product);
        res.json(result);
      
    })
    // Single Products for Purchase
    app.get ('/products/:id', async (req, res) => {
        const id= req.params.id;
        console.log (id);
        const query = {_id: ObjectId(id)};
        const product = await productsCollection.findOne(query);
      
        res.json(product);
        
      })

    app.delete('/products/:id', async (req, res) => {
        const id = req.params.id; 
        const query = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.json(result);
      })
//   purchase item
    app.post('/purchase', async (req, res) => {
        const purchase = req.body;
        console.log('purchase', purchase);
        const purchaseResult = await purchaseCollection.insertOne(purchase);
        res.json(purchaseResult);
      
      })

    //   Get all users purchasing
    app.get('/purchase', async(req, res) => {
        const cursor = purchaseCollection.find({});
        const users = await cursor.toArray();
        res.send(users);
      })
    
      // Delete Booking or User
    app.delete('/purchase/:id', async (req, res) => {
        const id = req.params.id; 
        const query = { _id: ObjectId(id) };
        const result = await purchaseCollection.deleteOne(query);
        res.json(result);
      })

      app.get('/myOrders',  async (req, res) => {
        const email = req.query.email;
        const query = { email: email}
        const cursor = purchaseCollection.find(query);
        const purchases = await cursor.toArray();
        res.json(purchases);
    })

    app.delete('/myOrders/:id', async (req, res) => {
        const id = req.params.id; 
        const query = { _id: ObjectId(id) };
        const result = await purchaseCollection.deleteOne(query);
        res.json(result);
      })
    // status update
    app.put("/statusUpdate/:id", async (req, res) => {
        const filter = { _id: ObjectId(req.params.id) };
        console.log(req.params.id);
        const result = await purchaseCollection.updateOne(filter, {
        $set: {
            status: req.body.status,
        },
        });
        res.send(result);
        console.log(result);
    });

    // review
    app.post('/addReview', async (req, res) => {
        const result = await reviewCollection.insertOne(req.body);
        res.send(result);
    });

    app.get('/addReview', async(req, res) => {
        const cursor = reviewCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
      })

    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
    });

    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
        const user = req.body;
        // const requester = req.decodedEmail;
        // if (requester) {
        //     const requesterAccount = await usersCollection.findOne({ email: requester });
            // if (requesterAccount.role === 'admin') {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'admin' } };
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.json(result);
           // }
        // }
        // else {
        //     res.status(403).json({ message: 'you do not have access to make admin' })
        // }

    })


    }

    

    finally {
        // await client.close();
    }

}
run().catch(console.dir);
    
app.get('/', (req, res) => {
    res.send('Hello Baby Toy World!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})