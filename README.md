# Contracts UI with RMRK Viewer

Enhanced [Contracts UI](https://github.com/paritytech/contracts-ui) with RMRK Viewer for projects built with [Swanky Node](https://github.com/AstarNetwork/swanky-node).

![collections-viewer](https://user-images.githubusercontent.com/36539824/182578422-eb602499-458b-4261-929c-2fc740db94a1.png)
![nfts-viewer](https://user-images.githubusercontent.com/36539824/182578418-8550815b-8301-4802-ac54-8f33fd14486d.png)
![collection-view](https://user-images.githubusercontent.com/36539824/182578413-351bd224-bf16-4b8d-b945-e9c66c969403.png)
![nft-view](https://user-images.githubusercontent.com/36539824/182578406-0b04c3bd-e69c-4c21-98ec-cac189f5aad2.png)

## Run site

1. Clone this repository
2. Run `yarn install`
3. Run `yarn start`
4. Open `localhost:<port>` as shown in terminal


## Rooster DAO example

- Compile Rooster Governor Contract from https://github.com/RoosterDao/rooster-contracts
- Instantiate Contract via "Add New Contract" in Contracts UI
  - Don't forget to set `nftPrice` and `votingPeriod` (1h = 3,600,000)
- Execute function `createCollection`
- To create proposals and cast votes every account has to:
  - Execute function `becomeMember` (pay `nftPrice` from above)
  - Execute function `delegate` and select account
