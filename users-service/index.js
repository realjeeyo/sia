const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const typeDefs = gql`
  type User {
    id: Int
    name: String
    email: String
  }
  type Query {
    users: [User]
    user(id: Int!): User
  }
  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: Int!, name: String, email: String): User
    deleteUser(id: Int!): User
  }
`;

const resolvers = {
  Query: {
    users: async () => await prisma.user.findMany(),
    user: async (_, { id }) => await prisma.user.findUnique({ where: { id } }),
  },
  Mutation: {
    createUser: async (_, { name, email }) => await prisma.user.create({ data: { name, email } }),
    updateUser: async (_, { id, name, email }) => await prisma.user.update({ where: { id }, data: { name, email } }),
    deleteUser: async (_, { id }) => await prisma.user.delete({ where: { id } }),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Users service ready at ${url}`);
});
