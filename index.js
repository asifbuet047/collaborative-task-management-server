const PORT = process.env.PORT || 5000;
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();
const JWT_SECRET = process.env.JWT_SECRECT_KEY;
app.use(cors());
app.use(express.json());

const database_name = 'taskmanagement';
const tasks_collection_name = 'tasks';


const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const verifyUser = (request, response, next) => {
            if (!request.headers.authorization) {
                return response.status(401).send({ message: 'unauthorized access' });
            }
            const token = request.headers.authorization.split(' ')[1];
            if (token) {
                jwt.verify(token, JWT_SECRET, {
                    algorithms: 'HS512',
                    expiresIn: '1d',
                }, (error, decoded) => {
                    if (decoded) {
                        request.decoded = decoded;
                        next();
                    }
                    if (error) {
                        response.status(401).send({ message: 'Unauthorized access' });
                    }
                })
            } else {
                return response.status(401).send({ message: 'Unauthorized access' });
            }
        }

        app.post('/token', (request, response) => {
            jwt.sign(request.body, JWT_SECRET, {
                algorithm: 'HS512',
                expiresIn: '1d',
            }, (error, token) => {
                if (token) {
                    response.send({ ACCESS_TOKEN: token });
                } else {
                    response.send({ user: 'unauthorized', error: error });
                }
            });
        });


        app.get('/tasks', async (request, response) => {
            const data = await mongoClient.db(database_name).collection(tasks_collection_name).find().toArray();
            response.send(data);
        });


    } finally {

    }
}

run().catch(console.dir);

app.get('/', async (request, response) => {
    response.send(`SkillShare server is ready ${process.env.MONGODB_PASSWORD}`)

})

app.listen(PORT, () => {
    console.log(`SkillShare server on port ${PORT}`);
})