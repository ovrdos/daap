// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DAAP is ERC20, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public transferFeePercentage = 1;
    address public feeRecipient;

    constructor(address _feeRecipient) ERC20("DAAP", "DAAP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);

        feeRecipient = _feeRecipient;
        _mint(msg.sender, 240_000_000_000_000 * 10**18); // Mint initial supply
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal {
        //super._beforeTokenTransfer(from, to, amount);

        if (from == address(0) || to == address(0)) {
            return;
        }

        uint256 fee = (amount * transferFeePercentage) / 100;
        uint256 amountAfterFee = amount - fee;

        super._transfer(from, feeRecipient, fee);
        super._transfer(from, to, amountAfterFee);
    }

    function setTransferFeePercentage(uint256 newFeePercentage) external onlyRole(ADMIN_ROLE) {
        transferFeePercentage = newFeePercentage;
    }

    function setFeeRecipient(address newFeeRecipient) external onlyRole(ADMIN_ROLE) {
        feeRecipient = newFeeRecipient;
    }
}

