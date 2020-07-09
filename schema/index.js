const graphql = require("graphql");
const axios = require("axios");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const BASE_URL = "http://localhost:3000";

const CompanyType = new GraphQLObjectType({
  name: "company",
  fields: () => ({
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve({ id }, args) {
        const url = `http://localhost:3000/companies/${id}/users`;
        const response = await axios.get(url);
        return response.data;
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: {
      type: GraphQLString
    },
    firstName: {
      type: GraphQLString
    },
    age: {
      type: GraphQLInt
    },
    company: {
      type: CompanyType,
      async resolve({ companyId }, args) {
        if (companyId) {
          const url = `http://localhost:3000/companies/${companyId}`;
          const response = await axios.get(url);
          return response.data;
        }
        return null;
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        const url = `${BASE_URL}/users`;
        const response = await axios.get(url);
        return response.data;
      }
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, { id }) {
        const url = `http://localhost:3000/users/${id}`;
        const response = await axios.get(url);
        return response.data;
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, { id }) {
        const url = `http://localhost:3000/companies/${id}`;
        const response = await axios.get(url);
        return response.data;
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      async resolve(privateValue, { firstName, age, companyId }) {
        const url = `${BASE_URL}/users`;
        const response = await axios.post(url, { firstName, age });
        return response.data;
      }
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parentValue, { id }) {
        const url = `${BASE_URL}/users/${id}`;
        const response = await axios.delete(url);
        return response.data;
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parentValue, { id, firstName }) {
        const url = `${BASE_URL}/users/${id}`;
        const response = await axios.patch(url, { firstName });
        return response.data;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
