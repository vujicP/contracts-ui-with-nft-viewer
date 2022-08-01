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

const fetchImage = metadata =>
  fetch(resolveURL(metadata.image))
    .then(response => response.blob())
    .then(blob => ({
      imageUrl: URL.createObjectURL(blob),
      description: metadata.description,
    }));

export function useRmrkCollections() {
  const { api } = useApi();

  const queryCollectionCount = () =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.collectionIndex();
      resolve(result.toNumber());
    });

  const queryCollectionByIndex = index =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.collections(index);
      resolve(result.toHuman());
    });

  const queryCollections = () =>
    new Promise<any>(async (resolve, reject) => {
      const index = await queryCollectionCount();
      const collArray = [];
      for (let i = 0; i < index; i++) {
        collArray[i] = i;
      }
      const results = await Promise.all(collArray.map(x => queryCollectionByIndex(x)));
      const metadata = await Promise.all(
        results.map(x => (x.metadata.startsWith(ipfsPrefix) ? fetchMetadata(x.metadata) : null))
      );
      const images = await Promise.all(
        metadata.filter(x => x?.image).map(x => (x?.image ? fetchImage(x) : null))
      );
      resolve(images);
    });

  return { queryCollections };
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
