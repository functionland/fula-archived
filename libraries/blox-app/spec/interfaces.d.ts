export interface User {

    connectionDate: string; // UTC

    decentralizedId: string; // or number?
    
    imageUrl: string;

    username: string;

    peerId: string[]; // identifiers for separate hardware setups

    securityPassphrase: string;

    walletId: string; // or number? 

}


declare enum CryptoEvent {

    Mined,

    Purchase,

    Transfer,

}


export interface Reward {

    associatedTower: string; // tower unique identifier

    amount: number; // fula

    balance: number; // fula

    date: string; // UTC

    type: CryptoEvent;

}


declare enum DeviceType {

    Disk,

    Computer,

}


// external device

export interface Device {

    associatedTower: string | null; // tower unique identifier

    isSyncing: boolean; // computer only

    name: string;

    storageTotal: number; // megabytes

    type: DeviceType;

}


interface Settings {

    brightness: number;

    color: string;

}


declare enum TowerType {

    Fula,

    Storage,

    Hub,

}


export interface Tower {

    id: string; // randomly generated unique identifier

    name: string;

    poolId: string; // pool unique identifier

    settings: Settings;

    storageTotal: number; // megabytes

    userStorageAllocation: {

        decentralizedId: string;

        consumed: number;

        allocated: number;

    }[];

    type: TowerType;

}
  
export interface Blox {
    id: string; // peerId? is should be mac our something else because on the same tower we may have multiple peerID

    totalStorage: number;

    poolAllocation: number;

    usageStats: {

        decentralizedId: string

        storage: number

    }[];

    poolId: string; // pool unique | all the towers connect to same pool?
    
    towers: string[]; // tower unique identifiers

    // other fields
}

declare enum L2BlockChainType {
    Polkadot,
}

interface PoolRequirements {

    storage: number; // megabytes

    ping: number; // milliseconds

    range: number; // meters

}

export interface Pool {

    count: number; // number of connections

    id: string; // unique identifier

    isPublic: boolean;

    location: [number, number]; // coordinates?

    name: string;

    requirements: PoolRequirements;

    type: L2BlockChainType;

}

// What is the concept of Friend?
export interface Friend {

    status: "invited" | "accepted" // other status needed?

    connectionDate: string; // UTC : date user connected as friend

    decentralizedId: string; // or number?

    imageUrl: string;

    username: string;

    peerId: string[]; // identifiers for which blox hardware friend is invited to use

}
