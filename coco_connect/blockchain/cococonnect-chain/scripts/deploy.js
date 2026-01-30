async function main() {
  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  const registry = await ProductRegistry.deploy();
  await registry.waitForDeployment();

  console.log("ProductRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
