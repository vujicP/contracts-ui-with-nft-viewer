// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRmrkCollections } from './runtime-api';

export function ViewNfts() {
  const navigate = useNavigate();
  const { queryAllNfts } = useRmrkCollections();
  const [nfts, setNfts] = useState([]);
  useEffect(() => {
    queryAllNfts().then(x => setNfts(x));
  }, []);
  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      {nfts.map(nft => (
        <div className="col-span-3">
          <div
            onClick={() => navigate(`/rmrk-nft/${nft.collection.id}/${nft.id}`)}
            className="w-80 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-xl dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
              <img className="p-4" src={nft?.imageUrl}></img>
            </div>
            <div className="border-t -md pl-4 pt-4 pb-4 text-gray-500 dark:border-gray-700 border-gray-200 items-center text-base dark:text-gray-300 text-gray-500">
              <div className="mb-2 font-semibold">{nft?.metadata?.name}</div>
              <div>{nft?.metadata.description}</div>
              <div className="mt-2 italic">{nft?.collection.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
