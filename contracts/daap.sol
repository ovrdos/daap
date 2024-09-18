// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract DAAP is ERC20, ERC20Permit, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public transferFeePercentage = 1;
    address public feeRecipient;

    event FeeUpdated(uint256 newFeePercentage);
    event FeeRecipientUpdated(address indexed newFeeRecipient);

    constructor(address _feeRecipient) ERC20("DAAP", "DAAP") ERC20Permit("DAAP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Deployer gets admin role
        feeRecipient = _feeRecipient;
        _mint(msg.sender, 240_000_000_000_000 * 10**18); // Mint initial supply to deployer
    }

    // Function to set transfer fee percentage, only callable by admin
    function setTransferFeePercentage(uint256 newFeePercentage) external onlyRole(ADMIN_ROLE) {
        require(newFeePercentage <= 10, "Fee too high"); // Cap fee at 10%
        transferFeePercentage = newFeePercentage;
        emit FeeUpdated(newFeePercentage);
    }

    // Function to change the fee recipient, only callable by admin
    function setFeeRecipient(address newFeeRecipient) external onlyRole(ADMIN_ROLE) {
        require(newFeeRecipient != address(0), "Invalid address");
        feeRecipient = newFeeRecipient;
        emit FeeRecipientUpdated(newFeeRecipient);
    }

    // Hook into the _beforeTokenTransfer to apply transfer fees
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal {
        //super._beforeTokenTransfer(from, to, amount);

        // Skip fee for minting or burning
        if (from == address(0) || to == address(0)) {
            return; 
        }

        // Calculate the transfer fee
        uint256 fee = (amount * transferFeePercentage) / 100;
        uint256 amountAfterFee = amount - fee;

        // Transfer the fee to the feeRecipient
        super._transfer(from, feeRecipient, fee);

        // Adjust the amount being transferred
        super._transfer(from, to, amountAfterFee);
    }

    // Gasless approval using EIP-2612 Permit
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual override {
        super.permit(owner, spender, value, deadline, v, r, s);
    }
}
