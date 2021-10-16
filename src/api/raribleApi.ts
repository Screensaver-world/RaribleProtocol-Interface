import { useQuery } from 'react-query';
import { BidItem, Currency, NFTItemOrder, NFTOwner } from '../types';
import { EncodeOrderRequest, EncodeOrderResponse, SignedOrder } from './orderStructure';
import { QueryTypes } from './queryTypes';
import {
  GenerateNftTokenIdRequest,
  GetNftItemsRequest,
  GetNftItemsResponse,
  GetOrdersRequest,
  LazyMintRequestBody,
  NftItemsRequestType,
  OrderFilter,
  OrderRequestTypes,
} from './raribleRequestTypes';

const BASE_URL = 'https://ethereum-api-staging.rarible.org/v0.1';

export function useGetNftItemOrderActivity() {
  return useQuery<NFTItemOrder[]>('nft-item-order-activity', () => {
    return mockWithTimeout<NFTItemOrder[]>([
      {
        '@type': 'transfer',
        createdAt: new Date(),
        price: '10,02',
        currency: Currency.ETH,
        createdBy: {
          name: 'mladibejn',
          avatarUrl: 'https://avatars.githubusercontent.com/u/6930914?v=4',
        },
        quantity: 2,
      },
      {
        '@type': 'mint',
        createdAt: new Date(),
        price: '10,02',
        currency: Currency.ETH,
        createdBy: {
          name: 'mladibejn2',
          avatarUrl: 'https://avatars.githubusercontent.com/u/6930914?v=4',
        },
        quantity: 2,
      },
    ]);
  });
}

export function useGetNftBids() {
  return useQuery<BidItem[]>('nft-item-bids', () => {
    return mockWithTimeout<BidItem[]>([
      {
        createdAt: new Date(),
        createdByName: 'Lupus7',
        createdByImageUrl: 'https://avatars.githubusercontent.com/u/51007736?v=4',
        price: '0.01',
        quantity: 1,
        currency: Currency.RARI,
      },
      {
        createdAt: new Date(),
        createdByName: 'mladibejn',
        createdByImageUrl: 'https://avatars.githubusercontent.com/u/6930914?v=4',
        price: '1.01',
        quantity: 3,
        currency: Currency.RARI,
      },
    ]);
  });
}

export function useGetNFTItemOwnerships() {
  return useQuery<NFTOwner[]>('nft-item-owners', () => {
    return mockWithTimeout<NFTOwner[]>([
      {
        avatarUrl: 'https://avatars.githubusercontent.com/u/6930914?v=4',
        price: '10,02',
        currency: Currency.ETH,
        name: 'mladibejn',
        quantity: 2,
      },
      {
        avatarUrl: 'https://avatars.githubusercontent.com/u/6930914?v=4',
        price: '10,02',
        currency: Currency.ETH,
        name: 'mladibejn',
        quantity: 2,
      },
    ]);
  });
}

const mockWithTimeout = <T>(data: T) =>
  new Promise<T>((res) => {
    setTimeout(() => {
      res(data);
    }, 1000);
  });

export function useGetNftItems(searchParams: GetNftItemsRequest = {}) {
  return useQuery<GetNftItemsResponse>([QueryTypes.NFT_ITEMS, searchParams], async () => getNftItems(searchParams), {
    enabled: false,
  });
}

const searchTypesMapping = {
  [NftItemsRequestType.BY_CREATOR]: 'creator',
  [NftItemsRequestType.BY_OWNER]: 'owner',
  [NftItemsRequestType.BY_COLLECTION]: 'collections',
};

export async function getNftItems(searchParams: GetNftItemsRequest = {}) {
  const ownerOrCreator = searchTypesMapping[searchParams.type];

  if (ownerOrCreator) {
    searchParams[ownerOrCreator] = searchParams.address;
  }
  const query = encodeQuery(searchParams);
  return (await fetch(`${BASE_URL}/nft/items/${searchParams.type ?? NftItemsRequestType.ALL}?${query}`)).json();
}

export async function getNftItemById(id: string) {
  return (await fetch(`${BASE_URL}/nft/items/${id}?includeMeta=true`)).json();
}

export async function generateNftToken(params: GenerateNftTokenIdRequest) {
  return (
    await fetch(`${BASE_URL}/nft/collections/${params.collection}/generate_token_id?minter=${params.minter}`)
  ).json();
}

const orderTypeMapping = {
  [OrderFilter.BY_MAKER]: 'maker',
  [OrderFilter.BY_ITEM]: 'tokenId',
};

export async function getNftOrders(searchParams: GetOrdersRequest = {}) {
  const queryParam = orderTypeMapping[searchParams.filerBy];

  if (queryParam) {
    searchParams[queryParam] = searchParams.address;
  }
  const query = encodeQuery(searchParams);
  return (await fetch(`${BASE_URL}/order/orders/${searchParams.type ?? OrderRequestTypes.ALL}?${query}`)).json();
}

export function useGetNftOrders(searchParams: GetOrdersRequest = {}) {
  return useQuery<GetNftItemsResponse>([QueryTypes.NFT_ORDERS, searchParams], async () => getNftOrders(searchParams), {
    enabled: false,
  });
}

export async function mint(params: LazyMintRequestBody) {
  return (
    await fetch(`${BASE_URL}/nft/mints`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'content-type': 'application/json' },
    })
  ).json();
}

export async function encodeOrder(
  params: EncodeOrderRequest
): Promise<{ signMessage: { struct: EncodeOrderResponse } }> {
  return (
    await fetch(`${BASE_URL}/order/encoder/order`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'content-type': 'application/json' },
    })
  ).json();
}

export async function makeSellOrder(params: SignedOrder): Promise<any> {
  return (
    await fetch(`${BASE_URL}/order/orders`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'content-type': 'application/json' },
    })
  ).json();
}

const encodeQuery = (searchParams) =>
  Object.keys(searchParams)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(searchParams[key])}`)
    .join('&');
