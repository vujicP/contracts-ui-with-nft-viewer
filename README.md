# Contracts UI with RMRK Viewer

Enhanced [Contracts UI](https://github.com/paritytech/contracts-ui) with RMRK Viewer for projects built with [Swanky Node](https://github.com/AstarNetwork/swanky-node).

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