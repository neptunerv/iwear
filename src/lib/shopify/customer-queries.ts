export const CUSTOMER_FRAGMENT = `
  fragment CustomerFields on Customer {
    id
    firstName
    lastName
    email
    phone
    numberOfOrders
    defaultAddress {
      formatted
      city
      country
    }
    orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
      nodes {
        id
        orderNumber
        processedAt
        financialStatus
        fulfillmentStatus
        statusUrl
        totalPrice {
          amount
          currencyCode
        }
        lineItems(first: 10) {
          nodes {
            title
            quantity
            variant {
              image {
                url
                altText
                width
                height
              }
              product {
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE = `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_CREATE = `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_DELETE = `
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_QUERY = `
  ${CUSTOMER_FRAGMENT}
  query Customer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      ...CustomerFields
    }
  }
`;
