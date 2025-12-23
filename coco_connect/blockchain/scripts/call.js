const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // ✅ Read from ENV (works when called from Django)
  const investmentId = Number(process.env.INVESTMENT_ID || 1);
  const amount = Number(process.env.AMOUNT || 5000);

  const [signer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(
    "InvestmentRecord",
    contractAddress,
    signer
  );

  const tx = await contract.recordInvestment(investmentId, amount);
  console.log("Transaction sent. txHash:", tx.hash);

  await tx.wait();
  console.log("Investment recorded on-chain");
}

main().catch(console.error);
