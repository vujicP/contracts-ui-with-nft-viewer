// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from '../../src/ui/contexts';

const ipfsGateway = 'https://gateway.ipfs.io/ipfs/';
const ipfsPrefix = 'ipfs://ipfs/';
const resolveResource = resource => {
  if (resource.startsWith(ipfsPrefix)) {
    return ipfsGateway + resource.replace(ipfsPrefix, '');
  } else if (resource.startsWith('http')) {
    return resource;
  } else {
    return null;
  }
};

const fetchMetadata = metadata => {
  const resource = resolveResource(metadata);
  return resource ? fetch(resource).then(result => result?.json() ?? null) : null;
};

const fetchImage = url => resolveResource(url);
// fetch(resolveResource(url))
//   .then(response => response.blob())
//   .then(blob => URL.createObjectURL(blob));

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
      if (metadata && (metadata.mediaUri || metadata.image)) {
        imageUrl = await fetchImage(metadata.mediaUri || metadata.image);
      }
      resolve(
        Object.assign(data, {
          id: index,
          imageUrl,
          description: metadata?.description ?? null,
          metadata,
        })
      );
    });

  const queryCollections = (startIndex = null) =>
    new Promise<any>(async (resolve, reject) => {
      let index = null;
      if (startIndex) {
        index = startIndex - 1;
      } else {
        index = (await queryCollectionCount()) - 1;
      }

      const collArray = [];
      const minNumber = Math.max(0, index - 9);
      for (let i = index; i >= minNumber; i--) {
        collArray[index - i] = i;
      }

      const images = await Promise.all(collArray.map(x => queryCollectionByIndex(x)));
      const filteredImages = images.filter(x => x?.description);

      let result;
      if (minNumber > 0) {
        result = filteredImages;
      } else {
        result = { collections: filteredImages, end: true };
      }

      resolve(result);
    });

  const queryResourceImage = resource =>
    new Promise<any>(async (resolve, reject) => {
      const metadata = await fetchMetadata(resource?.metadata);
      let imageUrl = null;
      if (metadata && metadata.mediaUri) {
        imageUrl = await fetchImage(metadata.mediaUri);
      }
      resolve(imageUrl);
    });

  const queryResources = (collectionId, nftId, resourceId = 0) =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.resources(
        Number(collectionId),
        Number(nftId),
        resourceId
      );
      const resource = result.toHuman();
      if (!resource) {
        resolve(resource);
        return;
      }
      let imageUrl = null;
      if (resource.resource && resource.resource.Basic) {
        imageUrl = await queryResourceImage(resource?.resource?.Basic);
      }
      resolve({ ...resource, imageUrl });
    });

  const queryNextResource = (collectionId, nftId) =>
    new Promise<any>(async (resolve, reject) => {
      let currentResource = await queryResources(collectionId, nftId, 0);
      let nextResource = await queryResources(collectionId, nftId, 1);

      let resourceId = 1;
      while (nextResource && !nextResource.pending) {
        currentResource = await queryResources(collectionId, nftId, resourceId);
        nextResource = await queryResources(collectionId, nftId, resourceId + 1);
        resourceId = resourceId + 1;
      }

      resolve({
        resourceId,
        currentResource,
        nextResource,
      });
    });

  const queryNft = (collectionId, nftId) =>
    new Promise<any>(async (resolve, reject) => {
      const result = await api.query.rmrkCore.nfts(collectionId, nftId);
      const nft = result.toHuman();
      const metadata = await fetchMetadata(nft.metadata);
      let imageUrl = null;
      if (metadata && metadata.mediaUri) {
        imageUrl = await fetchImage(metadata.mediaUri);
      }
      const resource = await queryNextResource(collectionId, nftId);
      const resources = await Promise.all(
        [...Array(resource?.resourceId ?? 0).keys()].map(id =>
          queryResources(collectionId, nftId, id)
        )
      );
      resolve(
        Object.assign(nft, { collectionId, id: nftId, metadata, imageUrl, ...resource, resources })
      );
    });

  const queryNfts = collectionId =>
    new Promise<any>(async (resolve, reject) => {
      const index = await api.query.rmrkCore.nextNftId(collectionId);

      const collArray = [];
      const minNumber = Math.min(-1, index - 1 - 10);
      for (let i = index - 1; i > minNumber; i--) {
        collArray[i] = i;
      }

      const results = await Promise.all(collArray.map(x => queryNft(collectionId, x)));
      results.reverse();
      resolve(results);
    });

  const queryAllNfts = (startIndex = null) =>
    new Promise<any>(async (resolve, reject) => {
      const collections = await queryCollections(startIndex);

      const nfts = await Promise.all(
        (collections.collections ?? collections).map(async (x, i) => {
          const nfts = await queryNfts(x.id);
          return nfts.map(y =>
            Object.assign(y, { collection: collections?.collections?.[i] ?? collections[i] })
          );
        })
      );

      let result;
      if (collections.end) {
        result = { end: true, nfts: nfts.flat() };
      } else {
        result = nfts.flat();
      }

      resolve(result);
    });

  return { queryCollections, queryCollectionByIndex, queryAllNfts, queryNfts, queryNft };
}

export const useRmrkAcceptResource = () => {
  const { api, keyring } = useApi();

  const acceptResource = async ({ collectionId, nftId, resourceId = 0, accountId }) =>
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
