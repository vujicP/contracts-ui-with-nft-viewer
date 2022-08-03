// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getContractInfo } from 'api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useApi } from 'ui/contexts';
import { PageFull } from 'ui/templates';
import { Address } from './Address';
import { useRmrkCollections } from './runtime-api';

export function ViewNft() {
  const { queryNft, queryCollectionByIndex } = useRmrkCollections();
  const { collectionId, nftId } = useParams();
  const { api, keyring } = useApi();

  const [nft, setNft] = useState({} as any);
  const [collection, setCollection] = useState({} as any);
  const [ownedBy, setOwnedBy] = useState({} as any);
  const [createdBy, setCreatedBy] = useState({} as any);

  useEffect(() => {
    queryCollectionByIndex(collectionId).then(setCollection);
    queryNft(collectionId, nftId).then(setNft);
  }, []);

  useEffect(() => {
    if (collection.issuer) {
      getContractInfo(api, collection.issuer).then(info => {
        if (info) {
          setCreatedBy({ name: 'Smart Contract', address: collection.issuer });
        } else {
          setCreatedBy(keyring.getPair(collection.issuer));
        }
      });
    }
  }, [collection.issuer]);

  useEffect(() => {
    if (nft.owner?.AccountId) {
      setOwnedBy(keyring.getPair(nft.owner?.AccountId));
    }
  }, [nft.owner?.AccountId]);

  return (
    <PageFull header="RMRK viewer" help={'Explore RMRK collections and NFTs'}>
      <h2 className="inline text-xl font-semibold dark:text-white text-gray-700">
        {nft.metadata?.name}
      </h2>
      <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
        <img className="p-4" src={nft?.imageUrl}></img>
      </div>
      <div className="mb-4">
        <div>NFT Id: {nft.id}</div>
        <div>
          Collection Id:
          <Link
            className="ml-2 underline dark:hover:text-gray-300 hover:text-gray-400"
            to={`/rmrk-collection/${nft.collectionId}`}
          >
            {nft.collectionId}
          </Link>
        </div>
        <div>
          <span className="mr-2">Owned by: {ownedBy.meta?.name}</span>
          <Address address={ownedBy.address}></Address>
        </div>
        <div>
          <span className="mr-2">Created by: {createdBy.name}</span>
          <Address address={createdBy.address}></Address>
        </div>
        <div>Image resource: {nft.metadata?.mediaUri}</div>
      </div>
    </PageFull>
  );
}
