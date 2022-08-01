// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { useRmrkCollections } from './runtime-api';

export function ViewCollections() {
  const { queryCollections } = useRmrkCollections();
  const [collections, setCollections] = useState([]);

  queryCollections().then(x => setCollections(x));

  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      {collections.map(collection => (
        <div className="col-span-3 ">
          <div className="justify-between items-center border text-gray-500 dark:border-gray-700 border-gray-200 rounded-xl dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer">
            <div className="items-center text-base dark:text-gray-300 text-gray-500 space-x-2">
              <div className="flex mt-6 w-80">
                <img className="max-w-full max-h-full" src={collection.imageUrl}></img>
              </div>
            </div>
            <div className="border-t -md pl-4 pt-4 pb-4 text-gray-500 dark:border-gray-700 border-gray-200 items-center text-base dark:text-gray-300 text-gray-500">
              {collection.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
