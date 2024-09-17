// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DAAP is ERC20, AccessControl {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Transfer fee percentage (1% default)
    uint256 public transferFeePercentage = 1;
    address public feeRecipient;

    // Constructor for initializing the contract
    constructor(address _feeRecipient) ERC20("DAAP", "DAAP") {
        // Admin gets default roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender); // By default, the admin is the minter
        _grantRole(BURNER_ROLE, msg.sender); // By default, the admin is the burner

        // Set the fee recipient address
        feeRecipient = _feeRecipient;

        // Mint initial supply to the deployer/admin
        _mint(msg.sender, 240_000_000_000_000 * 10**18); // Mint 240 trillion tokens
    }

    // Minting function (only callable by accounts with the MINTER_ROLE)
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // Burning function (only callable by accounts with the BURNER_ROLE)
    function burn(uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
    }

    // Hook into the transfer process to deduct a fee
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal {
        //super._beforeTokenTransfer(from, to, amount);

        // Skip fee for minting or burning operations
        if (from == address(0) || to == address(0)) {
            return; // No fees on minting or burning
        }

        // Calculate the transfer fee (1% by default)
        uint256 fee = (amount * transferFeePercentage) / 100;

        // Reduce the transfer amount by the fee
        uint256 amountAfterFee = amount - fee;

        // Transfer the fee to the feeRecipient
        super._transfer(from, feeRecipient, fee);

        // Modify the amount to reflect the deducted fee
        super._transfer(from, to, amountAfterFee);
    }

    // Set the transfer fee percentage (only callable by admin)
    function setTransferFeePercentage(uint256 newFeePercentage) external onlyRole(ADMIN_ROLE) {
        transferFeePercentage = newFeePercentage;
    }

    // Set a new fee recipient (only callable by admin)
    function setFeeRecipient(address newFeeRecipient) external onlyRole(ADMIN_ROLE) {
        feeRecipient = newFeeRecipient;
    }

    // Additional admin role management functions
    function grantMinterRole(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    function grantBurnerRole(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(BURNER_ROLE, account);
    }
}
