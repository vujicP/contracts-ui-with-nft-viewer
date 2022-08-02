// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from '../../src/ui/contexts';

const ipfsGateway = 'https://gateway.ipfs.io/ipfs/';
const ipfsPrefix = 'ipfs://ipfs/';
const resolveURL = url => {
  if (url.startsWith(ipfsPrefix)) {
    return ipfsGateway + url.replace(ipfsPrefix, '');
  } else {
    return '';
  }
};

const fetchMetadata = metadata =>
  fetch(resolveURL(metadata)).then(result => result?.json() ?? 'no metadata');

const fetchImage = url =>
  fetch(resolveURL(url))
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob));

export function useRmrkCollections() {
  const { api } = useApi();

  const queryCollectionCount = () =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.collectionIndex();
      resolve(result.toNumber());
    });

  const queryCollectionByIndex = index =>
    new Promise<any>(async (resolve, reject) => {
      const response = await api.query.rmrkCore.collections(index);
      const data = response.toHuman();
      let metadata = null;
      if (
        data.metadata &&
        (data.metadata.startsWith(ipfsPrefix) || data.metadata.startsWith('http'))
      ) {
        metadata = await fetchMetadata(data.metadata);
      }
      let imageUrl = null;
      if (metadata && metadata.image) {
        imageUrl = await fetchImage(metadata.image);
      }
      resolve({ id: index, imageUrl, description: metadata.description, metadata });
    });

  const queryCollections = () =>
    new Promise<any>(async (resolve, reject) => {
      const index = await queryCollectionCount();
      const collArray = [];
      for (let i = 0; i < index; i++) {
        collArray[i] = i;
      }
      const images = await Promise.all(collArray.map(x => queryCollectionByIndex(x)));
      images.reverse();
      resolve(images.filter(x => x?.description));
    });

  const queryNft = (collection, nftId) =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.nfts(collection.id, nftId);
      const json = result.toHuman();
      const metadata = await fetchMetadata(json.metadata);
      const imageUrl = await fetchImage(metadata.mediaUri);
      resolve({ collection, nftId, metadata, imageUrl });
    });

  const queryNfts = collection =>
    new Promise<any>(async (resolve, reject) => {
      const index = await api.query.rmrkCore.nextNftId(collection.id);

      const collArray = [];
      for (let i = 0; i < index.toNumber() - 1; i++) {
        collArray[i] = i;
      }

      const results = await Promise.all(collArray.map(x => queryNft(collection, x)));
      results.reverse();
      resolve(results);
    });

  const queryAllNfts = () =>
    new Promise<any>(async (resolve, reject) => {
      const collections = await queryCollections();
      const nfts = await Promise.all(collections.map(queryNfts));
      resolve(nfts.flat());
    });

  return { queryCollections, queryAllNfts };
}

export function useRmrkCoreResources() {
  const { api } = useApi();
  const { value: accountId } = useGlobalAccountId();

  const queryResources = (collectionId, nftId, resourceId = 0) =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.resources(
        Number(collectionId),
        Number(nftId),
        resourceId
      );
      resolve(result.toHuman());
    });

  const queryNextResource = (collectionId, nftId) =>
    new Promise<any>(async (resolve, reject) => {
      let currentNft = await queryResources(collectionId, nftId, 0);
      let nextNft = await queryResources(collectionId, nftId, 1);

      let resourceId = 1;
      while (nextNft && !nextNft.pending) {
        currentNft = await queryResources(collectionId, nftId, resourceId);
        nextNft = await queryResources(collectionId, nftId, resourceId + 1);
        resourceId = resourceId + 1;
      }

      resolve({
        resourceId,
        currentNft,
        nextNft,
        accountId,
      });
    });

  return { queryResources, queryNextResource };
}

export const useRmrkAcceptResource = () => {
  const { api, keyring } = useApi();
  const { value: accountId } = useGlobalAccountId();

  const acceptResource = async ({ collectionId, nftId, resourceId }) =>
    new Promise<any>(async (resolve, reject) => {
      const txHash = await api.tx.rmrkCore
        .acceptResource(Number(collectionId), Number(nftId), Number(resourceId))
        .signAndSend(keyring.getPair(accountId), async result => {
          await result;
          if (result.isCompleted) {
            resolve(true);
          }
        });
    });

  return { acceptResource };
};
