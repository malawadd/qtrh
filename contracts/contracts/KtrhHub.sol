
pragma solidity ^0.8.19;

import {Ktrhs, KtrhsConfig, KtrhsHistory, KtrhsConfigImpl, KtrhsReceiver} from "./Ktrh.sol";
import {Managed} from "./Managed.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
using SafeERC20 for IERC20;


struct UserMetadata {
    bytes32 key;
    bytes value;
}


contract KtrhsHub is Managed, Ktrhs, Splits {
    uint256 public constant MAX_DRIPS_RECEIVERS = _MAX_DRIPS_RECEIVERS;
    uint8 public constant AMT_PER_SEC_EXTRA_DECIMALS = _AMT_PER_SEC_EXTRA_DECIMALS;
    uint160 public constant AMT_PER_SEC_MULTIPLIER = _AMT_PER_SEC_MULTIPLIER;
    uint256 public constant MAX_SPLITS_RECEIVERS = _MAX_SPLITS_RECEIVERS;
    uint32 public constant TOTAL_SPLITS_WEIGHT = _TOTAL_SPLITS_WEIGHT;
    uint256 public constant DRIVER_ID_OFFSET = 224;
    uint256 public constant MAX_TOTAL_BALANCE = _MAX_TOTAL_DRIPS_BALANCE;
    uint32 public immutable cycleSecs;
    uint160 public immutable minAmtPerSec;
    bytes32 private immutable _ktrhsHubStorageSlot = _erc1967Slot("eip1967.ktrhsHub.storage");
    event DriverRegistered(uint32 indexed driverId, address indexed driverAddr);
    event DriverAddressUpdated(
        uint32 indexed driverId, address indexed oldDriverAddr, address indexed newDriverAddr
    );
    event Withdrawn(IERC20 indexed erc20, address indexed receiver, uint256 amt);
    event UserMetadataEmitted(uint256 indexed userId, bytes32 indexed key, bytes value);
    struct KtrhsHubStorage {
        uint32 nextDriverId;
        mapping(uint32 driverId => address) driverAddresses;
        mapping(IERC20 erc20 => uint256) totalBalances;
    }

    constructor(uint32 cycleSecs_)
        Ktrhs(cycleSecs_, _erc1967Slot("eip1967.ktrhs.storage"))
        Splits(_erc1967Slot("eip1967.splits.storage"))
    {
        cycleSecs = Ktrhs._cycleSecs;
        minAmtPerSec = Ktrhs._minAmtPerSec;
    }

    modifier onlyDriver(uint256 userId) {
        
        uint32 driverId = uint32(userId >> DRIVER_ID_OFFSET);
        _assertCallerIsDriver(driverId);
        _;
    }

    
    function _assertCallerIsDriver(uint32 driverId) internal view {
        require(driverAddress(driverId) == msg.sender, "Callable only by the driver");
    }

    function registerDriver(address driverAddr) public whenNotPaused returns (uint32 driverId) {
        require(driverAddr != address(0), "Driver registered for 0 address");
        KtrhsHubStorage storage ktrhsHubStorage = _ktrhsHubStorage();
        driverId = ktrhsHubStorage.nextDriverId++;
        ktrhsHubStorage.driverAddresses[driverId] = driverAddr;
        emit DriverRegistered(driverId, driverAddr);
    }

    function driverAddress(uint32 driverId) public view returns (address driverAddr) {
        return _ktrhsHubStorage().driverAddresses[driverId];
    }

    
    function updateDriverAddress(uint32 driverId, address newDriverAddr) public whenNotPaused {
        _assertCallerIsDriver(driverId);
        _ktrhsHubStorage().driverAddresses[driverId] = newDriverAddr;
        emit DriverAddressUpdated(driverId, msg.sender, newDriverAddr);
    }

    function nextDriverId() public view returns (uint32 driverId) {
        return _ktrhsHubStorage().nextDriverId;
    }

    function totalBalance(IERC20 erc20) public view returns (uint256 balance) {
        return _ktrhsHubStorage().totalBalances[erc20];
    }

    function withdraw(IERC20 erc20, address receiver, uint256 amt) public {
        uint256 withdrawable = erc20.balanceOf(address(this)) - totalBalance(erc20);
        require(amt <= withdrawable, "Withdrawal amount too high");
        emit Withdrawn(erc20, receiver, amt);
        erc20.safeTransfer(receiver, amt);
    }

    function _increaseTotalBalance(IERC20 erc20, uint128 amt) internal {
        if (amt == 0) return;
        uint256 newBalance = _ktrhsHubStorage().totalBalances[erc20] += amt;
        require(newBalance <= MAX_TOTAL_BALANCE, "Total balance too high");
        require(newBalance <= erc20.balanceOf(address(this)), "ERC-20 balance too low");
    }

    function _decreaseTotalBalance(IERC20 erc20, uint128 amt) internal {
        if (amt == 0) return;
        _ktrhsHubStorage().totalBalances[erc20] -= amt;
    }

    
    function receivableKtrhsCycles(uint256 userId, IERC20 erc20)
        public
        view
        returns (uint32 cycles)
    {
        return Ktrhs._receivableKtrhsCycles(userId, _assetId(erc20));
    }

    
    function receiveKtrhsResult(uint256 userId, IERC20 erc20, uint32 maxCycles)
        public
        view
        returns (uint128 receivableAmt)
    {
        (receivableAmt,,,,) = Ktrhs._receiveKtrhsResult(userId, _assetId(erc20), maxCycles);
    }

    
    function receiveKtrhs(uint256 userId, IERC20 erc20, uint32 maxCycles)
        public
        whenNotPaused
        returns (uint128 receivedAmt)
    {
        uint256 assetId = _assetId(erc20);
        receivedAmt = Ktrhs._receiveKtrhs(userId, assetId, maxCycles);
        if (receivedAmt > 0) Splits._addSplittable(userId, assetId, receivedAmt);
    }

    function squeezeKtrhs(
        uint256 userId,
        IERC20 erc20,
        uint256 senderId,
        bytes32 historyHash,
        KtrhsHistory[] memory ktrhsHistory
    ) public whenNotPaused returns (uint128 amt) {
        uint256 assetId = _assetId(erc20);
        amt = Ktrhs._squeezeKtrhs(userId, assetId, senderId, historyHash, ktrhsHistory);
        if (amt > 0) Splits._addSplittable(userId, assetId, amt);
    }

    function squeezeKtrhsResult(
        uint256 userId,
        IERC20 erc20,
        uint256 senderId,
        bytes32 historyHash,
        KtrhsHistory[] memory ktrhsHistory
    ) public view returns (uint128 amt) {
        (amt,,,,) =
            Ktrhs._squeezeKtrhsResult(userId, _assetId(erc20), senderId, historyHash, ktrhsHistory);
    }

    
    function splittable(uint256 userId, IERC20 erc20) public view returns (uint128 amt) {
        return Splits._splittable(userId, _assetId(erc20));
    }

    
    function splitResult(uint256 userId, SplitsReceiver[] memory currReceivers, uint128 amount)
        public
        view
        returns (uint128 collectableAmt, uint128 splitAmt)
    {
        return Splits._splitResult(userId, currReceivers, amount);
    }

    
    function split(uint256 userId, IERC20 erc20, SplitsReceiver[] memory currReceivers)
        public
        whenNotPaused
        returns (uint128 collectableAmt, uint128 splitAmt)
    {
        return Splits._split(userId, _assetId(erc20), currReceivers);
    }

    function collectable(uint256 userId, IERC20 erc20) public view returns (uint128 amt) {
        return Splits._collectable(userId, _assetId(erc20));
    }

    
    function collect(uint256 userId, IERC20 erc20)
        public
        whenNotPaused
        onlyDriver(userId)
        returns (uint128 amt)
    {
        amt = Splits._collect(userId, _assetId(erc20));
        _decreaseTotalBalance(erc20, amt);
    }

    
    function give(uint256 userId, uint256 receiver, IERC20 erc20, uint128 amt)
        public
        whenNotPaused
        onlyDriver(userId)
    {
        _increaseTotalBalance(erc20, amt);
        Splits._give(userId, receiver, _assetId(erc20), amt);
    }

    
    function ktrhsState(uint256 userId, IERC20 erc20)
        public
        view
        returns (
            bytes32 ktrhsHash,
            bytes32 ktrhsHistoryHash,
            uint32 updateTime,
            uint128 balance,
            uint32 maxEnd
        )
    {
        return Ktrhs._ktrhsState(userId, _assetId(erc20));
    }

    function balanceAt(
        uint256 userId,
        IERC20 erc20,
        KtrhsReceiver[] memory currReceivers,
        uint32 timestamp
    ) public view returns (uint128 balance) {
        return Ktrhs._balanceAt(userId, _assetId(erc20), currReceivers, timestamp);
    }

    
    
    
    function setKtrhs(
        uint256 userId,
        IERC20 erc20,
        KtrhsReceiver[] memory currReceivers,
        int128 balanceDelta,
        KtrhsReceiver[] memory newReceivers,
        
        uint32 maxEndHint1,
        uint32 maxEndHint2
    ) public whenNotPaused onlyDriver(userId) returns (int128 realBalanceDelta) {
        if (balanceDelta > 0) _increaseTotalBalance(erc20, uint128(balanceDelta));
        realBalanceDelta = Ktrhs._setKtrhs(
            userId,
            _assetId(erc20),
            currReceivers,
            balanceDelta,
            newReceivers,
            maxEndHint1,
            maxEndHint2
        );
        if (realBalanceDelta < 0) _decreaseTotalBalance(erc20, uint128(-realBalanceDelta));
    }

    
    
    function hashKtrhs(KtrhsReceiver[] memory receivers) public pure returns (bytes32 ktrhsHash) {
        return Ktrhs._hashKtrhs(receivers);
    }

    function hashKtrhsHistory(
        bytes32 oldKtrhsHistoryHash,
        bytes32 ktrhsHash,
        uint32 updateTime,
        uint32 maxEnd
    ) public pure returns (bytes32 ktrhsHistoryHash) {
        return Ktrhs._hashKtrhsHistory(oldKtrhsHistoryHash, ktrhsHash, updateTime, maxEnd);
    }

    
    function emitUserMetadata(uint256 userId, UserMetadata[] calldata userMetadata)
        public
        whenNotPaused
        onlyDriver(userId)
    {
        unchecked {
            for (uint256 i = 0; i < userMetadata.length; i++) {
                UserMetadata calldata metadata = userMetadata[i];
                emit UserMetadataEmitted(userId, metadata.key, metadata.value);
            }
        }
    }

    
    function _ktrhsHubStorage() internal view returns (KtrhsHubStorage storage storageRef) {
        bytes32 slot = _ktrhsHubStorageSlot;
        
        assembly {
            storageRef.slot := slot
        }
    }

    function _assetId(IERC20 erc20) internal pure returns (uint256 assetId) {
        return uint160(address(erc20));
    }
}
