interface ITagEncryption {
    didAudience: string;
    CID: string;
    symetricKey: string
    encrypt(symetricKey: string, CID: string, didAudience: string): Promise<void>;
    decrypt(jwe: any): Promise<void>;
}

export class TaggedEncryption implements ITagEncryption {
    private _did: any;
    didAudience!: string;
    CID!: string;
    symetricKey!: string

    constructor (DID: any) {
      this._did = DID;
      this.symetricKey = ''
    }

    async encrypt(symetricKey: string, CID: string, didAudience: string): Promise<void> {
        return await this._did.createDagJWE({ symetricKey: symetricKey,  CID: CID}, [didAudience])
    }

    async decrypt(jwe: any): Promise<void>  {
        return await this._did.decryptDagJWE(jwe);
    }
}