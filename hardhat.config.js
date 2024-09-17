require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.20",  // Make sure this matches the Solidity version in your contracts
  networks: {
    hardhat: {
      chainId: 1337,  // Specify the chainId for your local Hardhat network
    },
  },
};

