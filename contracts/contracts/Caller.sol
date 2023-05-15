// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ECDSA, EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

using EnumerableSet for EnumerableSet.AddressSet;

struct Call {
    address target;
    bytes data;
    uint256 value;
}

contract Caller is EIP712("Caller", "1"), ERC2771Context(address(this)) {
    
    uint256 public constant MAX_NONCE_INCREASE = 10 ** 9;
    string internal constant CALL_SIGNED_TYPE_NAME = "CallSigned("
        "address sender,address target,bytes data,uint256 value,uint256 nonce,uint256 deadline)";
    bytes32 internal immutable callSignedTypeHash = keccak256(bytes(CALL_SIGNED_TYPE_NAME));

    mapping(address sender => AddressSetClearable) internal _authorized;
    mapping(address sender => uint256) public nonce;
    struct AddressSetClearable {
        uint256 clears;
        mapping(uint256 clears => EnumerableSet.AddressSet) addressSets;
    }

    event CalledAs(address indexed sender, address indexed authorized);
    event Authorized(address indexed sender, address indexed authorized);
    event Unauthorized(address indexed sender, address indexed unauthorized);
    event UnauthorizedAll(address indexed sender);
    event CalledSigned(address indexed sender, uint256 nonce);
    event NonceSet(address indexed sender, uint256 newNonce);

    function authorize(address user) public {
        address sender = _msgSender();
        require(_getAuthorizedSet(sender).add(user), "Address already is authorized");
        emit Authorized(sender, user);
    }

    
    function unauthorize(address user) public {
        address sender = _msgSender();
        require(_getAuthorizedSet(sender).remove(user), "Address is not authorized");
        emit Unauthorized(sender, user);
    }

    function unauthorizeAll() public {
        address sender = _msgSender();
        _authorized[sender].clears++;
        emit UnauthorizedAll(sender);
    }

    function isAuthorized(address sender, address user) public view returns (bool authorized) {
        return _getAuthorizedSet(sender).contains(user);
    }

    function allAuthorized(address sender) public view returns (address[] memory authorized) {
        return _getAuthorizedSet(sender).values();
    }

    function callAs(address sender, address target, bytes calldata data)
        public
        payable
        returns (bytes memory returnData)
    {
        address authorized = _msgSender();
        require(isAuthorized(sender, authorized), "Not authorized");
        emit CalledAs(sender, authorized);
        return _call(sender, target, data, msg.value);
    }

    function callSigned(
        address sender,
        address target,
        bytes calldata data,
        uint256 deadline,
        bytes32 r,
        bytes32 sv
    ) public payable returns (bytes memory returnData) {
        
        require(block.timestamp <= deadline, "Execution deadline expired");
        uint256 currNonce = nonce[sender]++;
        bytes32 executeHash = keccak256(
            abi.encode(
                callSignedTypeHash, sender, target, keccak256(data), msg.value, currNonce, deadline
            )
        );
        address signer = ECDSA.recover(_hashTypedDataV4(executeHash), r, sv);
        require(signer == sender, "Invalid signature");
        emit CalledSigned(sender, currNonce);
        return _call(sender, target, data, msg.value);
    }

    
    function setNonce(uint256 newNonce) public {
        address sender = _msgSender();
        uint256 currNonce = nonce[sender];
        require(newNonce > currNonce, "Nonce not increased");
        require(newNonce <= currNonce + MAX_NONCE_INCREASE, "Nonce increased by too much");
        nonce[sender] = newNonce;
        emit NonceSet(sender, newNonce);
    }

    function callBatched(Call[] calldata calls)
        public
        payable
        returns (bytes[] memory returnData)
    {
        returnData = new bytes[](calls.length);
        address sender = _msgSender();
        for (uint256 i = 0; i < calls.length; i++) {
            Call calldata call = calls[i];
            returnData[i] = _call(sender, call.target, call.data, call.value);
        }
    }

    
    function _getAuthorizedSet(address sender)
        internal
        view
        returns (EnumerableSet.AddressSet storage authorizedSet)
    {
        AddressSetClearable storage authorized = _authorized[sender];
        return authorized.addressSets[authorized.clears];
    }

    function _call(address sender, address target, bytes calldata data, uint256 value)
        internal
        returns (bytes memory returnData)
    {
        
        return Address.functionCallWithValue(target, bytes.concat(data, bytes20(sender)), value);
    }
}
