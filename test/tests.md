#Happy Path Tests#
Token Transfer: Successful transfer of tokens between accounts.
Approve & TransferFrom: Ensuring tokens can be approved for delegation and transferred by a third party.
Minting: A valid minter can mint new tokens successfully.
Burning: A user with the proper permissions can burn tokens.
Vesting Schedule: Verify tokens are released according to the step-based vesting schedule.
Role Management: Admin can assign roles (Minter, Monitor) successfully.

#Exception Path Tests#
Transfer Without Balance: Attempting to transfer more tokens than available in the balance.
Unauthorized Minting: Non-minters trying to mint tokens.
Unauthorized Burning: Attempting to burn tokens without the necessary permissions.
Invalid Approvals: Approving more tokens than a user has.
Role Mismanagement: Unauthorized users attempting to assign or revoke roles.
Vesting Timing: Trying to transfer tokens before they are released according to the vesting schedule.
