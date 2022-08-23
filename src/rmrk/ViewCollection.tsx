// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AccountSelect } from 'ui/components';
import { PageFull } from 'ui/templates';
import { InfoData } from './Infodata';
import { useRmrkCollections } from './runtime-api';
import { useGlobalAccountId } from './useGlobalAccountId';

export function ViewCollection() {
  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useGlobalAccountId();
  const { queryCollectionByIndex, queryNfts } = useRmrkCollections();
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const [nfts, setNfts] = useState([]);
  const [collection, setCollection] = useState({} as any);
  useEffect(() => {
    queryCollectionByIndex(collectionId).then(setCollection);
    queryNfts(collectionId).then(setNfts);
  }, []);

  const entries = {
    'Collection Id': collection.id,
    Description: collection.description,
  };

  if (collection.metadata?.image) {
    entries['Image resource'] = collection.metadata.image;
  }

  return (
    <PageFull
      header="RMRK viewer"
      help={'Explore RMRK collections and NFTs'}
      accessory={
        <AccountSelect
          id="accountId"
          className="mb-2"
          value={accountId}
          onChange={setAccountId}
          {...accountIdValidation}
        />
      }
    >
      <div className="mb-4">
        <InfoData entries={entries}></InfoData>
      </div>
      <div className="grid grid-cols-12 gap-4 w-full">
        {nfts.map(nft => (
          <div className="col-span-3" key={nft?.id}>
            <div
              onClick={() => navigate(`/rmrk-nft/${collection.id}/${nft.id}`)}
              className="w-72 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-xl dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
                <img className="p-4" src={nft?.imageUrl}></img>
              </div>
              <div className="border-t -md pl-4 pt-4 pb-4 text-gray-500 dark:border-gray-700 border-gray-200 items-center text-base dark:text-gray-300 text-gray-500">
                <div className="mb-2 font-semibold">{nft?.metadata?.name}</div>
                <div className="mb-2">Id: {nft.id}</div>
                <div>{nft.metadata?.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageFull>
  );
}
