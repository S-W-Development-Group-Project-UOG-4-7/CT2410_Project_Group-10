// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InvestmentRecord {
    struct Investment {
        address investor;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => Investment) public investments;

    event InvestmentRecorded(uint256 indexed investmentId, address indexed investor, uint256 amount);

    function recordInvestment(uint256 investmentId, uint256 amount) external {
        require(!investments[investmentId].exists, "Already recorded");
        require(amount > 0, "Amount must be > 0");

        investments[investmentId] = Investment({
            investor: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            exists: true
        });

        emit InvestmentRecorded(investmentId, msg.sender, amount);
    }
}
