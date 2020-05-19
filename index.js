const express = require('express');
const graphqlHTTP = require('express-graphql');
const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
const schema = require('./schema/RootSchema');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
const jwt = require('express-jwt');
const path = require("path");

const app = express();

app.use(bodyParser.json());

const authMiddleware = jwt({
  secret: require('./config/keys').JWTsecret,
  credentialsRequired: false,
});

app.use(authMiddleware);

const db = require('./config/keys').mongoURI;

// Allow cross origin request
app.use(cors());

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDb connected ...')
  })
  .catch(err => console.log(err));

mongoose.set('useFindAndModify', false);

app.use('/voyager', voyagerMiddleware({ endpointUrl: '/api/graphql' }));

// Base api for all our graphql calls.
app.use('/api/graphql', authMiddleware, graphqlHTTP(req => ({
  schema,
  context: {
    user: req.user
  },
  graphiql: true,
})));

app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, "index.html")))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Now listening to port ${PORT}`))