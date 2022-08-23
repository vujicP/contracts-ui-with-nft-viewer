// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getContractInfo } from 'api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { AccountSelect, LoaderSmall } from 'ui/components';
import { useApi } from 'ui/contexts';
import { PageFull } from 'ui/templates';
import { Address } from './Address';
import { InfoData } from './Infodata';
import { useRmrkAcceptResource, useRmrkCollections } from './runtime-api';
import { useGlobalAccountId } from './useGlobalAccountId';

export function ViewNft() {
  const { queryNft, queryCollectionByIndex } = useRmrkCollections();
  const { acceptResource } = useRmrkAcceptResource();
  const { collectionId, nftId } = useParams();
  const { api, keyring } = useApi();

  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useGlobalAccountId();

  const [nft, setNft] = useState({} as any);
  const [collection, setCollection] = useState({} as any);
  const [ownedBy, setOwnedBy] = useState({} as any);
  const [createdBy, setCreatedBy] = useState({} as any);
  const [isAccepting, setIsAccepting] = useState(false);

  const fetchData = () => {
    queryCollectionByIndex(collectionId).then(setCollection);
    queryNft(collectionId, nftId).then(setNft);
  };

  useEffect(() => {
    fetchData();
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

  const clickAcceptResource = async () => {
    setIsAccepting(true);
    await acceptResource({
      collectionId,
      nftId,
      resourceId: nft?.nextResource?.id,
      accountId,
    });
    fetchData();
    setIsAccepting(false);
  };

  const isResourceAvailable = !!nft?.nextResource;

  const canAcceptResource = nft?.owner?.AccountId === accountId;

  const entries = {
    'NFT Id': nft.id,
    'Collection Id': (
      <>
        {nft.collectionId}
        <Link
          className="ml-2 text-s underline italic text-gray-500 dark:hover:text-gray-300 hover:text-gray-400"
          to={`/rmrk-collection/${nft.collectionId}`}
        >
          <span className="text-sm">Go to collection</span>
        </Link>
      </>
    ),
    "Owned by": <>{ownedBy.meta?.name} <Address address={ownedBy.address}></Address></>,
    "Created by":<>{createdBy.name} <Address address={createdBy.address}></Address></>,
    "Image resource": nft.metadata?.mediaUri
  };

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
      <h2 className="inline text-xl font-semibold dark:text-white text-gray-700">
        {nft.metadata?.name}
      </h2>
      <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
        <img className="p-4" src={nft?.imageUrl}></img>
      </div>
      <div className="mt-4 mb-8">
        <InfoData entries={entries}></InfoData>
      </div>
      {Array.isArray(nft.resources) && (
        <>
          {' '}
          <h2 className="inline text-l font-semibold dark:text-white text-gray-700">Resources</h2>
          {canAcceptResource && isResourceAvailable && !isAccepting && (
            <div className="flex mt-6 mb-6">
              <div className="mr-4 inline flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                <span>There is a new resource available.</span>
              </div>
              <a
                onClick={clickAcceptResource}
                className="inline-flex w-max justify-between items-center px-6 py-4 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-md dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
                  <span>Accept</span>
                </div>
              </a>
            </div>
          )}
          {isAccepting && (
            <div className="flex mt-6 mb-6">
              <LoaderSmall
                isLoading={isAccepting}
                message="The new resource is being accepted."
              ></LoaderSmall>
            </div>
          )}
          <div className="mt-4 grid grid-cols-12 gap-4 w-full">
            {nft.resources.map(resource => (
              <div className="col-span-3" key={resource?.id}>
                <div className="w-72 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-xl dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100">
                  <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
                    <img className="p-4" src={resource?.imageUrl}></img>
                  </div>
                  <div className="border-t -md pl-4 pt-4 pb-4 text-gray-500 dark:border-gray-700 border-gray-200 items-center text-base dark:text-gray-300 text-gray-500">
                    <div className="mb-2 font-semibold">Resource Id: {resource?.id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PageFull>
  );
}
