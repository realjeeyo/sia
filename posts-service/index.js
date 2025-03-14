const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const typeDefs = gql`
  type Post {
    id: Int
    title: String
    content: String
  }
  type Query {
    posts: [Post]
    post(id: Int!): Post
  }
  type Mutation {
    createPost(title: String!, content: String!): Post
    updatePost(id: Int!, title: String, content: String): Post
    deletePost(id: Int!): Post
  }
`;

const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
    post: async (_, { id }) => await prisma.post.findUnique({ where: { id } }),
  },
  Mutation: {
    createPost: async (_, { title, content }) => await prisma.post.create({ data: { title, content } }),
    updatePost: async (_, { id, title, content }) => await prisma.post.update({ where: { id }, data: { title, content } }),
    deletePost: async (_, { id }) => await prisma.post.delete({ where: { id } }),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 Posts service ready at ${url}`);
});
