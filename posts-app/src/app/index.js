import { ApolloProvider } from "@apollo/client";
import client from "../lib/apolloClient";
import PostTable from "../components/PostTable";

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>Posts per User</h1>
        <PostTable />
      </div>
    </ApolloProvider>
  );
}
