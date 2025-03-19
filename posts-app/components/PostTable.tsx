"use client"; // if using Next.js app directory
import React, { useEffect, useState } from "react";
import { gql, useQuery, useSubscription } from "@apollo/client";

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
    }
  }
`;

const POST_CREATED_SUBSCRIPTION = gql`
  subscription OnPostCreated {
    postCreated {
      id
      title
      content
    }
  }
`;

const PostTable = () => {
  const { data, loading, error, refetch } = useQuery(GET_POSTS);
  const [posts, setPosts] = useState([]);

  // Update posts state when initial query returns
  useEffect(() => {
    if (data && data.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  // Listen for new posts via subscription and refetch data
  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: () => {
      refetch(); // Force a refetch when a new post is created
    },
  });

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Posts</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Content</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post: any) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
