async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const DAAP = await ethers.getContractFactory("DAAP");
    const daap = await DAAP.deploy(deployer.address);

    await daap.deployed();
    console.log("DAAP deployed to:", daap.address);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
