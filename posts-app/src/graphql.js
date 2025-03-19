import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query {
    posts {
      id
      title
      content
      user {
        name
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $userId: ID!) {
    createPost(title: $title, content: $content, userId: $userId) {
      id
      title
      content
      user {
        name
      }
    }
  }
`;

export const POST_SUBSCRIPTION = gql`
  subscription {
    postCreated {
      id
      title
      content
      user {
        name
      }
    }
  }
`;
