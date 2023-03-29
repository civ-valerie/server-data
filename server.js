// ---------------------------------------------------------
// ********** server file for fetching the data ************
// ---------------------------------------------------------

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

// connection à la base de données:
app.get('/civision/connect', async (req, res) => {
    const startTime = process.hrtime();
    mongoose.connect('mongodb+srv://Nicilis:TMuV.&snhkVDEj%3A$QsV4@civision.y95gl.mongodb.net/civision', { useUnifiedTopology: true })
        .then(() => {
            const elapsedTime = process.hrtime(startTime);
            console.log(`Connection to MongoDB successful. Elapsed time: ${elapsedTime[0]}.${(elapsedTime[1] / 1000000).toFixed(0)}s`);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.error('Connection to MongoDB failed:', err);
            res.sendStatus(500);
        });
});

app.get('/civision/getRegions/:userEmail', async (req, res) => {
    try {
        const userEmail = req.params.userEmail;
        const user = await mongoose.connection.db.collection('users').findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const region = user.region;
        return res.send({ region });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Server error' });
    }
});

// get personnalisé pour accéder à une collection en particulier:
app.get('/civision/:collectionName', async (req, res) => {
    try {
        const startTime = process.hrtime();
        const collectionName = req.params.collectionName;
        const collection = mongoose.connection.db.collection(collectionName);
        const regions = JSON.parse(req.query.regions);

        if (regions[0] === 'all') var data = await collection.find().toArray(); //if all return everything
        else var data = await collection.find({ region: { $in: regions } }).toArray(); //if there's a region return only those

        res.json(data); // retourne la collection en json à l'écran
        const elapsedTime = process.hrtime(startTime);
        console.log(`Elapsed time to retrieve ${req.params.collectionName} from ${req.query.regions} = ${elapsedTime[0]}.${(elapsedTime[1] / 1000000).toFixed(0)}s`)
    } catch (err) {
        console.error(`Failed to fetch documents from collection ${collectionName}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});