// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PageFull } from 'ui/templates';
import { useRmrkCollections } from './runtime-api';

export function ViewNft() {
  const { queryNft } = useRmrkCollections();
  const { collectionId, nftId } = useParams();
  const [nft, setNft] = useState({} as any);
  useEffect(() => {
    queryNft(collectionId, nftId).then(setNft);
  }, []);
  return (
    <PageFull header="RMRK viewer" help={'Explore RMRK collections and NFTs'}>
      <h2 className="inline text-xl font-semibold dark:text-white text-gray-700">{nft.metadata?.name}</h2>
      <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
        <img className="p-4" src={nft?.imageUrl}></img>
      </div>
      <div className="mb-4">
        <div>NFT Id: {nft.id}</div>
        <div>Collection Id: {nft.collectionId}</div>
        <div>Owned by: {nft.owner?.AccountId}</div>
        <div>Image resource: {nft.metadata?.mediaUri}</div>
      </div>
    </PageFull>
  );
}
