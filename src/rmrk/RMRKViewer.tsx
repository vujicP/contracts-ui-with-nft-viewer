// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CollectionIcon, CreditCardIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { PageFull } from 'ui/templates';
import { AccountSelect, Tabs } from 'ui/components';
import { ViewNfts } from 'src/rmrk/ViewNfts';
import { ViewCollections } from 'src/rmrk/ViewCollections';
import { useGlobalAccountId } from './useGlobalAccountId';

export function RMRKViewer() {
  const TABS = [
    {
      id: 'nfts',
      label: (
        <>
          <CreditCardIcon />
          NFTs
        </>
      ),
    },
    {
      id: 'collections',
      label: (
        <>
          <CollectionIcon />
          Collections
        </>
      ),
    },
  ];

  const [tabIndex, setTabIndex] = useState(0);

  const { value: accountId, onChange: setAccountId, ...accountIdValidation } = useGlobalAccountId();

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
      <Tabs index={tabIndex} setIndex={setTabIndex} tabs={TABS}>
        <ViewNfts></ViewNfts>
        <ViewCollections></ViewCollections>
      </Tabs>
    </PageFull>
  );
}
