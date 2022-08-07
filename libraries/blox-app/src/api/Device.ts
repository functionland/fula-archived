import { Blox, Tower } from "../../spec/interfaces";


interface Device {

    getBlox(): Blox 

    setBox(b: Partial<Blox>): boolean

    getTower(id: string): Tower

    getTowers(): Tower[]
    
    setTower(t: Partial<Tower>): boolean

}