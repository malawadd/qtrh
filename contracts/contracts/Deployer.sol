// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.17;

import {AddressDriver} from "./AddressDriver.sol";
import {Caller} from "./Caller.sol";
import {KtrhsHub} from "./KtrhHub.sol";
import {Managed, ManagedProxy} from "./Managed.sol";


contract Deployer {
    
    address public creator;

    KtrhsHub public ktrhsHub;
    bytes public ktrhsHubArgs;
    uint32 public ktrhsHubCycleSecs;
    KtrhsHub public ktrhsHubLogic;
    bytes public ktrhsHubLogicArgs;
    address public ktrhsHubAdmin;

    Caller public caller;
    bytes public callerArgs;

    AddressDriver public addressDriver;
    bytes public addressDriverArgs;
    AddressDriver public addressDriverLogic;
    bytes public addressDriverLogicArgs;
    address public addressDriverAdmin;
    uint32 public addressDriverId;



    constructor(
        uint32 ktrhsHubCycleSecs_,
        address ktrhsHubAdmin_,
        address addressDriverAdmin_,
        address nftDriverAdmin_,
        address immutableSplitsDriverAdmin_
    ) {
        creator = msg.sender;
        _deployKtrhsHub(ktrhsHubCycleSecs_, ktrhsHubAdmin_);
        _deployCaller();
        _deployAddressDriver(addressDriverAdmin_);
    }

    function _deployKtrhsHub(uint32 ktrhsHubCycleSecs_, address ktrhsHubAdmin_) internal {
        
        ktrhsHubCycleSecs = ktrhsHubCycleSecs_;
        ktrhsHubLogicArgs = abi.encode(ktrhsHubCycleSecs);
        ktrhsHubLogic = new KtrhsHub(ktrhsHubCycleSecs);
        ktrhsHubAdmin = ktrhsHubAdmin_;
        ManagedProxy proxy = new ManagedProxy(ktrhsHubLogic, ktrhsHubAdmin);
        ktrhsHub = KtrhsHub(address(proxy));
        ktrhsHubArgs = abi.encode(ktrhsHubLogic, ktrhsHubAdmin);
    }

    function _deployCaller() internal {
        caller = new Caller();
        callerArgs = abi.encode();
    }

    
    function _deployAddressDriver(address addressDriverAdmin_) internal {
        address forwarder = address(caller);
        uint32 driverId = ktrhsHub.nextDriverId();
        addressDriverLogicArgs = abi.encode(ktrhsHub, forwarder, driverId);
        addressDriverLogic = new AddressDriver(ktrhsHub, forwarder, driverId);
        addressDriverAdmin = addressDriverAdmin_;
        ManagedProxy proxy = new ManagedProxy(addressDriverLogic, addressDriverAdmin);
        addressDriver = AddressDriver(address(proxy));
        addressDriverArgs = abi.encode(addressDriverLogic, addressDriverAdmin);     
        addressDriverId = ktrhsHub.registerDriver(address(addressDriver));
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}
