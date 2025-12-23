const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [signer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(
    "InvestmentRecord",
    contractAddress,
    signer
  );

  const investmentId = 1;
  const amount = 5000;

  const tx = await contract.recordInvestment(investmentId, amount);
  console.log("Transaction sent. txHash:", tx.hash);

  await tx.wait();
  console.log("Investment recorded on-chain");
}

main().catch(console.error);
