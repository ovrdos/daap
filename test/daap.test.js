const expect = require("chai");
const ethers = require("ethers");


describe("DAAP Token Contract", function () {
    let DAAP;
    let daap;
    let owner;
    let addr1;
    let addr2;

    // This runs before each test, redeploying the contract
    beforeEach(async function () {
        DAAP = await ethers.getContractFactory("DAAP");
        [owner, addr1, addr2] = await ethers.getSigners();
        daap = await DAAP.deploy(owner.address); // owner is the feeRecipient by default
        await daap.deployed();
    });

    // Test 1: Should assign total supply to the owner
    it("Should assign total supply to owner", async function () {
        const ownerBalance = await daap.balanceOf(owner.address);
        expect(await daap.totalSupply()).to.equal(ownerBalance);
    });

    // Test 2: Should allow admin to set transfer fee percentage
    it("Should allow admin to set transfer fee percentage", async function () {
        await daap.setTransferFeePercentage(2); // Setting fee to 2%
        expect(await daap.transferFeePercentage()).to.equal(2);
    });

    // Test 3: Should fail to set transfer fee by non-admin
    it("Should not allow non-admin to set transfer fee", async function () {
        await expect(daap.connect(addr1).setTransferFeePercentage(5)).to.be.revertedWith(
            "AccessControl: account"
        );
    });

    // Test 4: Should allow admin to change the fee recipient
    it("Should allow admin to change the fee recipient", async function () {
        await daap.setFeeRecipient(addr1.address); // Changing fee recipient to addr1
        expect(await daap.feeRecipient()).to.equal(addr1.address);
    });

    // Test 5: Should fail to change fee recipient by non-admin
    it("Should not allow non-admin to change fee recipient", async function () {
        await expect(daap.connect(addr1).setFeeRecipient(addr2.address)).to.be.revertedWith(
            "AccessControl: account"
        );
    });

    // Test 6: Should deduct a fee on transfer
    it("Should deduct a fee on transfer", async function () {
        await daap.transfer(addr1.address, 1000); // Transfer 1000 tokens to addr1
        const fee = 1000 * 1 / 100; // 1% fee (default)
        const expectedAmount = 1000 - fee;

        // Check addr1's balance after the transfer
        expect(await daap.balanceOf(addr1.address)).to.equal(expectedAmount);

        // Check the fee recipient's (owner's) balance
        const ownerBalance = await daap.balanceOf(owner.address);
        expect(ownerBalance).to.be.gt(fee); // Ensure owner received the fee
    });

    // Test 7: Should allow gasless approvals using permit() (EIP-2612)
    it("Should allow gasless approvals using permit()", async function () {
        const nonce = await daap.nonces(owner.address);
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1-hour deadline
        const domain = {
            name: "DAAP",
            version: "1",
            chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
            verifyingContract: daap.address,
        };

        const types = {
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
        };

        // Creating the EIP-2612 signature
        const signature = await owner._signTypedData(domain, types, {
            owner: owner.address,
            spender: addr1.address,
            value: 1000,
            nonce,
            deadline,
        });

        const { v, r, s } = ethers.utils.splitSignature(signature);

        // Call permit() to approve addr1 to spend 1000 tokens
        await daap.permit(owner.address, addr1.address, 1000, deadline, v, r, s);

        // Verify that the approval went through
        expect(await daap.allowance(owner.address, addr1.address)).to.equal(1000);
    });
});

