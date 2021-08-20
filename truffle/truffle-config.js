const getEnv = env => {
  const value = process.env[env];
  if (typeof value === 'undefined') {
    throw new Error(`${env} has not been set.`);
  }
  return value;
};

const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonic = getEnv('ETH_WALLET_MNEMONIC');

const rinkebyNetwork = getEnv('ETH_RINKEBY_NETWORK');
const rinkebyNetworkId = getEnv('ETH_RINKEBY_NETWORK_ID');
const rinkebyAddress = getEnv('ETH_ADDRESS');

const liveNetwork = getEnv('ETH_LIVE_NETWORK');
const liveNetworkId = getEnv('ETH_LIVE_NETWORK_ID');

const Web3 = require('web3');
const web3 = new Web3();

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: "*",
      gas: 5000000,
      gasPrice: 100000000000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, rinkebyNetwork),
      network_id: rinkebyNetworkId,
      gas: 7000000,
      gasPrice: web3.utils.toWei('10', 'gwei'),
      from: rinkebyAddress
    },
    live: {
      provider: () => new HDWalletProvider(mnemonic, liveNetwork),
      network_id: liveNetworkId,
      gas: 7000000,
      gasPrice: web3.utils.toWei('10', 'gwei')
    }
  }
};

