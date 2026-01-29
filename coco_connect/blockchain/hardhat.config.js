require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: process.env.AMOY_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 80002,
    },
  },
};

console.log("AMOY_RPC_URL:", process.env.AMOY_RPC_URL);
console.log("PK starts with 0x:", (process.env.DEPLOYER_PRIVATE_KEY || "").startsWith("0x"));
