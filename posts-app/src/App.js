import React, { useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { GET_POSTS, CREATE_POST, POST_SUBSCRIPTION } from "./graphql";
import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";

function App() {
  const { loading, error, data, refetch } = useQuery(GET_POSTS);
  const [createPost] = useMutation(CREATE_POST);
  const { data: subData } = useSubscription(POST_SUBSCRIPTION);

  useEffect(() => {
    if (subData) {
      refetch(); // Refresh data when a new post is added
    }
  }, [subData, refetch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleCreatePost = () => {
    createPost({
      variables: { title: "New Post", content: "This is a new post", userId: "1" },
    });
  };

  return (
    <Container>
      <h2>Posts</h2>
      <Button variant="contained" onClick={handleCreatePost}>Add Post</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.id}</TableCell>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.content}</TableCell>
              <TableCell>{post.user.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default App;
