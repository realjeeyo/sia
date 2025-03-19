const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PrismaClient } = require('@prisma/client');
const { gql } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const cors = require('cors');

const prisma = new PrismaClient();
const pubsub = new PubSub();

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
  type Subscription {
    postCreated: Post
  }
`;

const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
    post: async (_, { id }) => await prisma.post.findUnique({ where: { id } }),
  },
  Mutation: {
    createPost: async (_, { title, content }) => {
      const newPost = await prisma.post.create({ data: { title, content } });
      pubsub.publish('POST_CREATED', { postCreated: newPost });
      return newPost;
    },
    updatePost: async (_, { id, title, content }) =>
      await prisma.post.update({ where: { id }, data: { title, content } }),
    deletePost: async (_, { id }) =>
      await prisma.post.delete({ where: { id } }),
  },
  Subscription: {
    postCreated: {
      // Updated to use asyncIterableIterator
      subscribe: () => pubsub.asyncIterableIterator(['POST_CREATED']),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(cors());

const httpServer = createServer(app);

const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          },
        };
      },
    },
  ],
});

// Start the Apollo server
server.start().then(() => {
  server.applyMiddleware({ app });
  
  // Set up the subscription server using subscriptions-transport-ws
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );
  
  const PORT = 4002;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
});
