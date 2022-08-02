// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CollectionIcon, CreditCardIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { PageFull } from 'ui/templates';
import { Tabs } from 'ui/components';
import { ViewNfts } from 'src/rmrk/ViewNfts';
import { ViewCollections } from 'src/rmrk/ViewCollections';

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

  return (
    <PageFull header="RMRK viewer" help={'Explore RMRK collections and NFTs'}>
      <Tabs index={tabIndex} setIndex={setTabIndex} tabs={TABS}>
        <ViewNfts></ViewNfts>
        <ViewCollections></ViewCollections>
      </Tabs>
    </PageFull>
  );
}
