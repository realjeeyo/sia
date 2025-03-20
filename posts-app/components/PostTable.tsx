"use client";
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

  useEffect(() => {
    if (data && data.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: () => {
      refetch();
    },
  });

  if (loading) return <p className="text-center text-lg text-gray-500">Loading posts...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-8 flex flex-col items-center bg-gradient-to-br from-blue-100 to-purple-200 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Posts</h2>
      <div className="overflow-hidden shadow-lg rounded-2xl w-full max-w-4xl">
        <table className="w-full border-collapse bg-white/80 shadow-lg rounded-xl overflow-hidden">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-lg">ID</th>
              <th className="px-6 py-4 text-left text-lg">Title</th>
              <th className="px-6 py-4 text-left text-lg">Content</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post: any, index) => (
              <tr
                key={post.id}
                className={`transition-colors duration-300 hover:bg-indigo-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                }`}
              >
                <td className="px-6 py-4 border-b text-gray-700 font-medium">{post.id}</td>
                <td className="px-6 py-4 border-b text-gray-700">{post.title}</td>
                <td className="px-6 py-4 border-b text-gray-700">{post.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostTable;
