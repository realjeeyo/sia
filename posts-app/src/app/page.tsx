import ApolloProviderWrapper from "../../components/ApolloProviderWrapper";
import PostTable from "../../components/PostTable";

export default function Home() {
  return (
    <ApolloProviderWrapper>
      <div>
        <h1>Posts per User</h1>
        <PostTable />
      </div>
    </ApolloProviderWrapper>
  );
}
