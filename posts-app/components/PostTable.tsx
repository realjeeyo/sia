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
  const [searchTerm, setSearchTerm] = useState("");
  const [resultsPerPage, setResultsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (data?.posts) setPosts(data.posts);
  }, [data]);

  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: () => {
      refetch();
    },
  });

  const filteredPosts = posts.filter((post: any) =>
    `${post.title} ${post.content}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / resultsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handlePageChange = (dir: "prev" | "next") => {
    setCurrentPage((prev) =>
      dir === "prev" ? Math.max(prev - 1, 1) : Math.min(prev + 1, totalPages)
    );
  };

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;
  if (error) return <p className="text-center text-red-400">Error: {error.message}</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex flex-col items-center px-6 py-10">
      <h2 className="text-3xl font-semibold mb-6 text-white">Posts</h2>

      <div className="mb-4 w-full max-w-5xl flex flex-col sm:flex-row sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by title or content..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-1/2 px-4 py-2 bg-[#1a1a1a] text-white rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={resultsPerPage}
          onChange={(e) => {
            setResultsPerPage(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#1a1a1a] text-white rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {[5, 10, 20].map((count) => (
            <option key={count} value={count}>
              Show {count}
            </option>
          ))}
        </select>
      </div>

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
            {paginatedPosts.map((post: any, index) => (
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

      <div className="flex justify-between items-center mt-4 w-full max-w-5xl px-2 text-sm text-gray-400">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-[#1a1a1a] border border-gray-600 rounded-md hover:bg-[#2a2a2a] disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-[#1a1a1a] border border-gray-600 rounded-md hover:bg-[#2a2a2a] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PostTable;
