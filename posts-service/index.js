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
    deletePosts(ids: [Int!]!): BatchPayload
  }

  type Subscription {
    postCreated: Post
  }

  type BatchPayload {
    count: Int!
  }
`;

const resolvers = {
  Query: {
    posts: () => prisma.post.findMany(),
    post: (_, { id }) => prisma.post.findUnique({ where: { id } }),
  },
  Mutation: {
    createPost: async (_, { title, content }) => {
      const newPost = await prisma.post.create({ data: { title, content } });
      pubsub.publish('POST_CREATED', { postCreated: newPost });
      return newPost;
    },
    updatePost: (_, { id, title, content }) =>
      prisma.post.update({
        where: { id },
        data: { title, content },
      }),
    deletePost: (_, { id }) => prisma.post.delete({ where: { id } }),
    deletePosts: async (_, { ids }) => {
      const result = await prisma.post.deleteMany({
        where: { id: { in: ids } },
      });
      return { count: result.count };
    },
  },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterableIterator(['POST_CREATED']),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(cors());

const httpServer = createServer(app);
let subscriptionServer;

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

server.start().then(() => {
  server.applyMiddleware({ app });

  subscriptionServer = SubscriptionServer.create(
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
    console.log(`📡 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
});
