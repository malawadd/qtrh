// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.19;

import {
    KtrhsHub,
    KtrhsReceiver,
    IERC20,
    SafeERC20,
    UserMetadata
} from "./KtrhHub.sol";
import {Managed} from "./Managed.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";


contract AddressDriver is Managed, ERC2771Context {
    using SafeERC20 for IERC20;
    KtrhsHub public immutable dripsHub;
    uint32 public immutable driverId;

    constructor(KtrhsHub _dripsHub, address forwarder, uint32 _driverId)
        ERC2771Context(forwarder)
    {
        dripsHub = _dripsHub;
        driverId = _driverId;
    }

    function calcUserId(address userAddr) public view returns (uint256 userId) {
        userId = driverId;
        userId = (userId << 224) | uint160(userAddr);
    }

    
    function _callerUserId() internal view returns (uint256 userId) {
        return calcUserId(_msgSender());
    }

    function collect(IERC20 erc20, address transferTo) public whenNotPaused returns (uint128 amt) {
        amt = dripsHub.collect(_callerUserId(), erc20);
        if (amt > 0) dripsHub.withdraw(erc20, transferTo, amt);
    }

    function give(uint256 receiver, IERC20 erc20, uint128 amt) public whenNotPaused {
        if (amt > 0) _transferFromCaller(erc20, amt);
        dripsHub.give(_callerUserId(), receiver, erc20, amt);
    }

    
    function emitUserMetadata(UserMetadata[] calldata userMetadata) public whenNotPaused {
        dripsHub.emitUserMetadata(_callerUserId(), userMetadata);
    }

    function _transferFromCaller(IERC20 erc20, uint128 amt) internal {
        erc20.safeTransferFrom(_msgSender(), address(dripsHub), amt);
    }
}
