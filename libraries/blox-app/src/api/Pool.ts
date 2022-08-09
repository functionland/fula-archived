import { Pool, PoolRequirements } from "../../spec/interfaces";

// This is too hard for me to imagine!

interface PoolManager {

    getPool():Pool

    setPool(p: Partial<Pool>): boolean
    
}