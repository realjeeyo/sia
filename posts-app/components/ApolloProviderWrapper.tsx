"use client";  // Mark this as a Client Component

import { ApolloProvider } from "@apollo/client";
import client from "../lib/apolloClient";

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
