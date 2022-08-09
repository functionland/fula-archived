import { Blox, Tower, Device } from "../../spec/interfaces";


interface DeviceManager {

    getBlox(): Blox 

    setBox(b: Partial<Blox>): boolean

    getTower(id: string): Tower

    getTowers(): Tower[]
    
    setTower(t: Partial<Tower>): boolean

    getExternalDevices(): Device[]

    setDevices(d: Partial<Device>): boolean

}

