/** Full product payload for PDPs. */
export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    vendor
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 8) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          url
          altText
          width
          height
        }
        selectedOptions {
          name
          value
        }
      }
    }
    metafields(identifiers: [
      {namespace: "specs", key: "gender"},
      {namespace: "specs", key: "shape"},
      {namespace: "specs", key: "polarized"},
      {namespace: "specs", key: "frame_material"},
      {namespace: "specs", key: "front_colour"},
      {namespace: "specs", key: "lens_material"},
      {namespace: "specs", key: "lens_color"},
      {namespace: "specs", key: "temple_material"},
      {namespace: "specs", key: "geofit"},
      {namespace: "specs", key: "bridge_size_mm"},
      {namespace: "specs", key: "lens_width_mm"},
      {namespace: "specs", key: "lens_height_mm"},
      {namespace: "specs", key: "temple_length_mm"},
      {namespace: "reviews", key: "rating"},
      {namespace: "reviews", key: "rating_count"}
    ]) {
      namespace
      key
      value
      type
    }
  }
`;

/**
 * Lighter payload for catalog / listing pages.
 * Omits descriptionHtml and PDP-only metafields; keeps filter + tile fields.
 */
export const LIST_PRODUCT_FRAGMENT = `
  fragment ListProductFields on Product {
    id
    handle
    title
    description
    availableForSale
    vendor
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          url
          altText
          width
          height
        }
        selectedOptions {
          name
          value
        }
      }
    }
    metafields(identifiers: [
      {namespace: "specs", key: "gender"},
      {namespace: "specs", key: "shape"},
      {namespace: "specs", key: "polarized"},
      {namespace: "specs", key: "lens_color"}
    ]) {
      namespace
      key
      value
      type
    }
  }
`;

export const GET_PRODUCTS_QUERY = `
  ${LIST_PRODUCT_FRAGMENT}
  query GetProducts(
    $first: Int!
    $sortKey: ProductSortKeys!
    $reverse: Boolean!
    $query: String
    $after: String
  ) {
    products(
      first: $first
      sortKey: $sortKey
      reverse: $reverse
      query: $query
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ListProductFields
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
        products(first: 12) {
          nodes {
            id
            handle
            title
            availableForSale
            featuredImage {
              url
              altText
              width
              height
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `
  ${LIST_PRODUCT_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      nodes {
        ... on Product {
          ...ListProductFields
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_HANDLE_QUERY = `
  ${LIST_PRODUCT_FRAGMENT}
  query GetCollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first) {
        nodes {
          ...ListProductFields
        }
      }
    }
  }
`;
