import { User, Friend } from "../../spec/interfaces";

interface UserManager {
    
    getUser(): User

    setUser(u :Partial<User>): boolean

    getFriends(): Friend[]

}


