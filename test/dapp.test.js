const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("DAAP Token Contract", function () {
    let Token, daapToken, owner, addr1, addr2, minter;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("DAAPToken");
        [owner, addr1, addr2, minter] = await ethers.getSigners();
        daapToken = await Token.deploy();
    });

    describe("Happy Path", function () {
        it("Should assign total supply to owner", async function () {
            const ownerBalance = await daapToken.balanceOf(owner.address);
            expect(await daapToken.totalSupply()).to.equal(ownerBalance);
        });

        it("Should transfer tokens between accounts", async function () {
            await daapToken.transfer(addr1.address, 50);
            const addr1Balance = await daapToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            await daapToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await daapToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should allow minting by a minter", async function () {
            await daapToken.grantRole(ethers.utils.id("MINTER_ROLE"), minter.address);
            await daapToken.connect(minter).mint(addr1.address, 1000);
            const addr1Balance = await daapToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(1000);
        });
    });

    describe("Exception Paths", function () {
        it("Should fail when trying to transfer more than balance", async function () {
            const initialOwnerBalance = await daapToken.balanceOf(owner.address);
            await expect(daapToken.transfer(addr1.address, initialOwnerBalance + 1)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Should not allow non-minter to mint tokens", async function () {
            await expect(daapToken.connect(addr1).mint(addr1.address, 1000)).to.be.revertedWith("AccessControl: account is missing role MINTER_ROLE");
        });

        it("Should fail on burning without permission", async function () {
            await expect(daapToken.connect(addr1).burn(100)).to.be.revertedWith("AccessControl: account is missing role BURNER_ROLE");
        });

        it("Should prevent transfer before vesting unlocks", async function () {
            await daapToken.transfer(addr1.address, 100);
            await expect(daapToken.connect(addr1).transfer(addr2.address, 50)).to.be.revertedWith("Token not vested yet");
        });
    });
});

