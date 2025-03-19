import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// Ensure WebSocket and HTTP URLs match your backend
const httpLink = new HttpLink({
  uri: "http://localhost:4002/graphql", // Adjust if needed
});

// WebSocket link for subscriptions using graphql-ws
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4002/graphql", // Make sure your backend allows WS
    connectionParams: {
      reconnect: true, // Auto-reconnects WebSocket if disconnected
    },
  })
);

// Split HTTP & WebSocket links (Queries/Mutations → HTTP, Subscriptions → WS)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
