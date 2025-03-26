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
    if (data?.posts) setPosts(data.posts);
  }, [data]);

  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: () => {
      refetch();
    },
  });

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;
  if (error) return <p className="text-center text-red-400">Error: {error.message}</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex flex-col items-center px-6 py-10">
      <h2 className="text-3xl font-semibold mb-6 text-white">Posts</h2>
      <div className="w-full max-w-5xl bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-[#222] text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Title</th>
              <th className="px-6 py-4 text-left">Content</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post: any, index) => (
              <tr
                key={post.id}
                className={`${
                  index % 2 === 0 ? "bg-[#1f1f1f]" : "bg-[#2a2a2a]"
                } hover:bg-[#333] transition-colors`}
              >
                <td className="px-6 py-4">{post.id}</td>
                <td className="px-6 py-4">{post.title}</td>
                <td className="px-6 py-4">{post.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostTable;
