const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAAP Contract", function () {
    let DAAP;
    let daap;
    let owner;
    let addr1;
    let addr2;

    // Before each test, deploy a new instance of the DAAP contract
    beforeEach(async function () {
        DAAP = await ethers.getContractFactory("DAAP");
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy the contract with the owner as the fee recipient
        daap = await DAAP.deploy(owner.address);
        await daap.deployed();
    });

    // Test case to check if total supply is assigned to the owner
    it("Should assign total supply to owner", async function () {
        const ownerBalance = await daap.balanceOf(owner.address);
        expect(await daap.totalSupply()).to.equal(ownerBalance);
    });

    // Test case to ensure that a user with the MINTER_ROLE can mint tokens
    it("Should allow minting by a minter", async function () {
        // Grant addr1 the MINTER_ROLE
        await daap.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), addr1.address);

        // Mint tokens from addr1 (who now has the MINTER_ROLE)
        await daap.connect(addr1).mint(addr1.address, 1000);

        const addr1Balance = await daap.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(1000);
    });

    // Test case to ensure that a non-minter cannot mint tokens
    it("Should not allow non-minter to mint tokens", async function () {
        // addr2 does not have the MINTER_ROLE
        await expect(daap.connect(addr2).mint(addr2.address, 1000)).to.be.revertedWith("AccessControlUnauthorizedAccount");
    });

    // Test case to ensure that a user with the BURNER_ROLE can burn tokens
    it("Should allow burning by a burner", async function () {
        // Mint some tokens to addr1 so it can burn them
        await daap.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), addr1.address);
        await daap.connect(addr1).mint(addr1.address, 2000);

        // Grant addr1 the BURNER_ROLE
        await daap.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")), addr1.address);

        // Burn tokens from addr1 (who now has the BURNER_ROLE)
        await daap.connect(addr1).burn(1000);

        const addr1Balance = await daap.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(1000); // 2000 - 1000 burned
    });

    // Test case to ensure that a non-burner cannot burn tokens
    it("Should not allow non-burner to burn tokens", async function () {
        // Mint some tokens to addr2
        await daap.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), addr2.address);
        await daap.connect(addr2).mint(addr2.address, 1000);

        // addr2 does not have the BURNER_ROLE
        await expect(daap.connect(addr2).burn(1000)).to.be.revertedWith("AccessControlUnauthorizedAccount");
    });

    // Test case to ensure that transfer fees are deducted on transfers
    it.skip("Should deduct a fee on transfer", async function () {
        // Mint tokens to addr1 for the transfer
        await daap.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), addr1.address);
        await daap.connect(addr1).mint(addr1.address, 10000);

        // Initial owner balance (feeRecipient) before any transfer fees are received
        const initialOwnerBalance = await daap.balanceOf(owner.address);

        // Transfer from addr1 to addr2
        await daap.connect(addr1).transfer(addr2.address, 1000);

        // Calculate the fee (1% of 1000)
        const fee = 1000 * 1 / 100;
        const expectedAmount = 1000 - fee; // Expected amount for addr2

        // Check addr2's balance after the transfer
        expect(await daap.balanceOf(addr2.address)).to.equal(expectedAmount);

        // Check that the feeRecipient (owner) received the fee
        const ownerBalanceAfterFee = await daap.balanceOf(owner.address);
        expect(ownerBalanceAfterFee).to.equal(initialOwnerBalance.add(fee)); // Fee should be added to initial owner balance
    });



    // Test case to ensure only admin can change the transfer fee percentage
    it.skip("Should allow admin to change the transfer fee percentage", async function () {
        // Change the fee percentage to 2%
        await daap.setTransferFeePercentage(2);

        // Verify that the fee percentage has been updated
        expect(await daap.transferFeePercentage()).to.equal(2);
    });

    // Test case to ensure only admin can change the fee recipient
    it.skip("Should allow admin to change the fee recipient", async function () {
        // Change the fee recipient to addr1
        await daap.setFeeRecipient(addr1.address);

        // Verify that the fee recipient has been updated
        expect(await daap.feeRecipient()).to.equal(addr1.address);
    });
});

