const graphql = require('graphql');
const AgencyMeta = require('../models/AgencyModel/agencyMeta');
const ClientMeta = require('../models/ClientModel/clientMeta');
const User = require('../models/UserModel/user');
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken');

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLInputObjectType } = graphql;

/**
 * User schema which stores our users
 */
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString},
    email: { type: GraphQLString },
  })
});

/**
 * Defining the AgencyMeta schema which is a root type our app
 */
const AgencyType = new GraphQLObjectType({
  name: 'Agency',
  fields: () => ({
    id: { type: GraphQLID },
    Name: { type: GraphQLString},
    Address1: { type: GraphQLString},
    Address2: { type: GraphQLString},
    State: { type: GraphQLString},
    City: { type: GraphQLString},
    PhoneNumber: { type: GraphQLInt},
    date: { type: GraphQLID },
    clients: {
      type: new GraphQLList(ClientType),
      resolve: (parent, args) => ClientMeta.find({ AgencyId: parent.id })
    },
    biggestClient: {
      type: ClientType,
      resolve: async (parent, args) => ClientMeta.findOne({ AgencyId: parent.id }).sort('-TotalBill')
    }
  })
});

/**
 * So that we can use these parameters in the mutation
 */
const InputAgencyType = new GraphQLInputObjectType({
  name: 'InputAgency',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    Name: { type: GraphQLString},
    Address1: { type: GraphQLString},
    Address2: { type: GraphQLString},
    State: { type: GraphQLString},
    City: { type: GraphQLString},
    PhoneNumber: { type: GraphQLInt},
    date: { type: GraphQLID },
  })
});

/**
* Defining the ClientMeta schema which is a root type our app
*/
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    AgencyId: { type: GraphQLID },
    Name: { type: GraphQLString},
    Email: { type: GraphQLString},
    PhoneNumber: { type: GraphQLInt},
    TotalBill: { type: GraphQLInt},
    date: { type: GraphQLID },
    agency: {
      type: new GraphQLList(AgencyType),
      resolve: (parent, args) => AgencyMeta.find({ id: parent.AgencyId })
    },
  })
});

/**
* So that we can use these parameters in the mutation
*/
const InputClientType = new GraphQLInputObjectType({
  name: 'InputClient',
  fields: () => ({
    id: { type: GraphQLID },
    AgencyId: { type: GraphQLID },
    Name: { type: GraphQLString},
    Email: { type: GraphQLString},
    PhoneNumber: { type: GraphQLInt},
    TotalBill: { type: GraphQLInt},
    date: { type: GraphQLID },
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID }},
      resolve: (parent, args) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }

        User.findById(args.id);
      }
    },
    agency: {
      type: AgencyType,
      args: { id: { type: GraphQLID }},
      resolve: (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }

        return AgencyMeta.findById(args.id)
      },
    },
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID }},
      resolve: (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }

        return ClientMeta.findById(args.id)
      },
    },
    agencies: {
      type: new GraphQLList(AgencyType),
      resolve: async (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }

        return await AgencyMeta.find({});
      },
    },
    clients: {
      type: new GraphQLList(ClientType),
      resolve: (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }

        return ClientMeta.find({});
      },
    },
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signup: {
      type: GraphQLString,
      args: {
        username: {type: new GraphQLNonNull(GraphQLString)},
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve: async (parent, args) => {
        const { username, email, password } = args;
        let user = new User({
          username,
          email,
          password: await bcrypt.hash(password, 10)
        });

        user.save();
      return jsonwebtoken.sign(
        { id: user.id, email: user.email },
        require('../config/keys').JWTsecret,
        { expiresIn: '1y' });
      }
    },
    login: {
      type: GraphQLString,
      args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve: async (parent, args) => {
        const { email, password } = args;
        const user = await User.findOne({ email });
        console.log(user, email)
        if (!user) {
          throw new Error('No user with that email')
        }

        const valid = await bcrypt.compare(password, user.password)

        if (!valid) {
          throw new Error('Incorrect password')
        }

        // return json web token
        return jsonwebtoken.sign(
          { id: user.id, email: user.email },
          require('../config/keys').JWTsecret,
          { expiresIn: '1d' });
      }
    },
    addAgency: {
      type: AgencyType,
      args: {
        Name: { type: new GraphQLNonNull(GraphQLString) },
        Address1: { type: new GraphQLNonNull(GraphQLString) },
        Address2: { type: GraphQLString },
        State: { type: new GraphQLNonNull(GraphQLString) },
        City: { type: new GraphQLNonNull(GraphQLString) },
        PhoneNumber: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }
        const { Name, Address1, Address2, State, City, PhoneNumber } = args;
        let agency = new AgencyMeta({
          Name, 
          Address1,
          Address2,
          State,
          City,
          PhoneNumber
        });
        return agency.save();
      }
    },
    // Bulk Update Multiple Fields for Agency
    updateAgency: {
      type: AgencyType,
      args: {
        input: { type: new GraphQLNonNull(InputAgencyType) },
      },
      resolve: async (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }
        
        const { id } = args.input;
        // We don't want to update id
        delete args.input.id;
        return await AgencyMeta.findOneAndUpdate({ _id: id } , { ...args.input }, {
          returnOriginal: false,
        });
        }
    },
    addClient: {
      type: ClientType,
      args: {
        AgencyId: { type: new GraphQLNonNull(GraphQLID) },
        Name: { type: new GraphQLNonNull(GraphQLString) },
        Email: { type: new GraphQLNonNull(GraphQLString) },
        PhoneNumber: { type: new GraphQLNonNull(GraphQLInt) },
        TotalBill: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }
        const { AgencyId, Name, Email, PhoneNumber, TotalBill } = args;
        let client = new ClientMeta({
          AgencyId, 
          Name, 
          Email, 
          PhoneNumber, 
          TotalBill
        });
        return client.save();
      }
    },
    // Bulk Update Multiple Fields for Client
    updateClient: {
      type: AgencyType,
      args: {
        input: { type: new GraphQLNonNull(InputClientType) },
      },
      resolve: async (parent, args, context) => {
        if (!context.user) {
          throw new Error('You are not authorized!');
        }
        
        const { id } = args.input;
        // We don't want to update id
        delete args.input.id;
        return await ClientMeta.findOneAndUpdate({ _id: id } , { ...args.input }, {
          returnOriginal: false,
        });
        }
    },
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});