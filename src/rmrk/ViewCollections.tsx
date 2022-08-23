// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoaderSmall } from 'ui/components';
import { useRmrkCollections } from './runtime-api';

export function ViewCollections() {
  const navigate = useNavigate();
  const { queryCollections } = useRmrkCollections();
  const [collections, setCollections] = useReducer((state, collection) => {
    return collection === null ? [] : [...state, ...collection];
  }, []);
  const [observer, setObserver] = useState(null);
  const [scrollEndReached, setScrollEnd] = useState(false);
  const loader = useRef(null);

  const setQueryResult = result => {
    if (result.end) {
      setScrollEnd(true);
      setCollections(result.collections);
    } else {
      setCollections(result);
    }
  };

  useEffect(() => {
    queryCollections().then(setQueryResult);
  }, []);

  useEffect(() => {
    observer && observer.disconnect();
    setObserver(
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting === true && collections.length > 0 && !scrollEndReached) {
          queryCollections(collections.slice(-1)[0].id).then(setQueryResult);
        }
      })
    );
  }, [JSON.stringify(collections)]);

  useEffect(() => {
    if (loader.current && observer && observer.observe) {
      observer.observe(loader.current);
    }
  }, [observer]);

  useEffect(() => {
    scrollEndReached && observer && observer.disconnect();
  }, [scrollEndReached]);

  return (
    <>
      <div className="grid grid-cols-12 gap-4 w-full">
        {collections.map(collection => (
          <div className="col-span-3 " key={collection.id}>
            <div
              onClick={() => navigate(`/rmrk-collection/${collection.id}`)}
              className="w-72 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-xl dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
                <img className="p-4" src={collection.imageUrl}></img>
              </div>
              <div className="border-t -md pl-4 pt-4 pb-4 text-gray-500 dark:border-gray-700 border-gray-200 items-center text-base dark:text-gray-300 text-gray-500">
                <div className="font-semibold">{collection.description}</div>
                <div className="mt-2">Id: {collection.id}</div>
                <div className="mt-2 italic">Collection of {collection.nftsCount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4" ref={loader}>
        <LoaderSmall isLoading={!scrollEndReached} message={''}></LoaderSmall>
      </div>
    </>
  );
}
