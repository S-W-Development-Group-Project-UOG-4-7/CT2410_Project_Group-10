const hre = require("hardhat");

async function main() {
  const InvestmentRecord = await hre.ethers.getContractFactory("InvestmentRecord");
  const contract = await InvestmentRecord.deploy();

  await contract.waitForDeployment();

  console.log("InvestmentRecord deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
