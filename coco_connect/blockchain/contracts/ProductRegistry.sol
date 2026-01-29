// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductRegistry {
    struct Proof {
        bytes32 productHash;
        address recordedBy;
        uint256 recordedAt;
    }

    mapping(uint256 => Proof[]) private proofs; // productId => proof history

    event ProductProofRecorded(
        uint256 indexed productId,
        bytes32 productHash,
        address indexed recordedBy,
        uint256 recordedAt
    );

    function recordProductProof(uint256 productId, bytes32 productHash) external {
        proofs[productId].push(
            Proof({
                productHash: productHash,
                recordedBy: msg.sender,
                recordedAt: block.timestamp
            })
        );

        emit ProductProofRecorded(productId, productHash, msg.sender, block.timestamp);
    }

    function latestProof(uint256 productId) external view returns (Proof memory) {
        uint256 n = proofs[productId].length;
        require(n > 0, "No proofs");
        return proofs[productId][n - 1];
    }

    function proofCount(uint256 productId) external view returns (uint256) {
        return proofs[productId].length;
    }
}
