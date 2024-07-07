/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMedia = /* GraphQL */ `
  query GetMedia($id: ID!) {
    getMedia(id: $id) {
      id
      name
      medium
      creatorId
      creatorName
      watched
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listMedia = /* GraphQL */ `
  query ListMedia(
    $filter: ModelMediaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMedia(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        medium
        creatorId
        creatorName
        watched
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
