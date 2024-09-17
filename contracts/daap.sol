// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DAAP is ERC20, AccessControl {
    // Define roles for admin, minter, and burner
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Total supply for the token
    uint256 public constant INITIAL_SUPPLY = 240_000_000_000_000 * 10**18;

    constructor() ERC20("DAAP", "DAAP") {
        // Grant the contract deployer the admin role and mint initial supply
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        // Mint the initial supply to the deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // Minting function with role control
    function mint(address to, uint256 amount) public {
        require(hasRole(MINTER_ROLE, msg.sender), "AccessControl: account is missing role MINTER_ROLE");
        _mint(to, amount);
    }

    // Burning function with role control
    function burn(uint256 amount) public {
        require(hasRole(BURNER_ROLE, msg.sender), "AccessControl: account is missing role BURNER_ROLE");
        _burn(msg.sender, amount);
    }

    // Grant a new role
    function grantMinterRole(address account) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "DAAP: Must have admin role to grant minter role");
        _grantRole(MINTER_ROLE, account);
    }

    function grantBurnerRole(address account) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "DAAP: Must have admin role to grant burner role");
        _grantRole(BURNER_ROLE, account);
    }

    function grantAdminRole(address account) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "DAAP: Must have admin role to grant admin role");
        _grantRole(ADMIN_ROLE, account);
    }
}

