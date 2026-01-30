require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const AMOY_RPC_URL = process.env.AMOY_RPC_URL;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // ✅ only enable amoy if env vars exist (prevents HH8 error)
    ...(AMOY_RPC_URL && DEPLOYER_PRIVATE_KEY
      ? {
          amoy: {
            url: AMOY_RPC_URL,
            accounts: [DEPLOYER_PRIVATE_KEY],
            chainId: 80002,
          },
        }
      : {}),
  },
};
