import { Pool, PoolRequirements } from "../../spec/interfaces";


interface PoolAPI {
    Join(id: string): boolean
    Leave(id: string): boolean
    // This is too hard for me to imagine!
}