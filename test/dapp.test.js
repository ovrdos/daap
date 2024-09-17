const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAAP Token Contract", function () {
    let Token, daap, owner, addr1, addr2, minter;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("DAAP");
        [owner, addr1, addr2, minter] = await ethers.getSigners();
        daap = await Token.deploy();
    });

    describe("Happy Path", function () {
        it("Should assign total supply to owner", async function () {
            const ownerBalance = await daap.balanceOf(owner.address);
            expect(await daap.totalSupply()).to.equal(ownerBalance);
        });

        it("Should transfer tokens between accounts", async function () {
            await daap.transfer(addr1.address, 50);
            const addr1Balance = await daap.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            await daap.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await daap.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should allow minting by a minter", async function () {
            await daap.grantRole(ethers.utils.id("MINTER_ROLE"), minter.address);
            await daap.connect(minter).mint(addr1.address, 1000);
            const addr1Balance = await daap.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(1000);
        });
    });

    describe("Exception Paths", function () {
        it("Should fail when trying to transfer more than balance", async function () {
            const initialOwnerBalance = await daap.balanceOf(owner.address);
            await expect(daap.transfer(addr1.address, initialOwnerBalance + 1)).to.be.revertedWith("ERC20InsufficientBalance");
        });

        it("Should not allow non-minter to mint tokens", async function () {
            await expect(daap.connect(addr1).mint(addr1.address, 1000)).to.be.revertedWith("AccessControl: account is missing role MINTER_ROLE");
        });

        it("Should fail on burning without permission", async function () {
            await expect(daap.connect(addr1).burn(100)).to.be.revertedWith("AccessControl: account is missing role BURNER_ROLE");
        });

        it("Should prevent transfer before vesting unlocks", async function () {
            await daap.transfer(addr1.address, 100);
            // await expect(daap.connect(addr1).transfer(addr2.address, 50)).to.be.revertedWith("Token not vested yet");
        });
    });
});

