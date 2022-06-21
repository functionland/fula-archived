import React, { useState } from 'react';
import { FulaDID } from '@functionland/fula-sec';


export const Identity = ({onDIDSet}) => {
    const [mode, setMode] = useState('None');
    const [mnemonicText, setMnemonicText] = useState('');
    const [importType, setImportType] = useState('Mnemonic');
    const [didObj, setDidObj] = useState(null);
    const verity = async () => {
        let _didObj = null;
        try {
            const DID = new FulaDID();
            _didObj = await DID.create('sadasdasdasdasdasasdas','1234')
            setDidObj(_didObj);
            onDIDSet(DID)
        } catch (error) {
            alert(error);
        }
        console.log('didObj', _didObj);
    };
    const createNewIdentity = async () => {
        let didObj = null;
        setDidObj(null);
        try {
            const DID = new FulaDID();
            didObj = await DID.create();
            if (didObj) {
                setMode('New');
                setDidObj(didObj);
            }
        } catch (error) {
            alert(error);
        }
        console.log('New didObj', didObj);
    };
    const renderMode = (mode) => {
        // if (mode === 'None')
        //     return (
        //         <>
        //             <button className="single" onClick={createNewIdentity}>
        //                 New Identity
        //             </button>
        //             <button
        //                 className="single"
        //                 onClick={() => {
        //                     setDidObj(null);
        //                     setMode('Import');
        //                 }}>
        //                 Import Identity
        //             </button>
        //         </>
        //     );
        if (mode === 'Import') {
            return (
                <div className="container flex-column">
                    <h4>Please import mnemonic/private key to generate DID</h4>
                    <br />
                    <div>
                        <input
                            type="radio"
                            value="Mnemonic"
                            checked={importType === 'Mnemonic'}
                            name="importType"
                            onChange={(e) => setImportType(e.target.value)}
                        />{' '}
                        Mnemonic
                        <input
                            type="radio"
                            value="PrivateKey"
                            name="importType"
                            onChange={(e) => setImportType(e.target.value)}
                        />{' '}
                        Private key
                    </div>
                    <br />
                    <textarea
                        rows="5"
                        onChange={(e) => setMnemonicText(e.target.value)}
                    />
                    <br />
                    <div className="container justify-around">
                        <button className="single" onClick={() => setMode('None')}>
                            back
                        </button>
                        <button className="single" onClick={verity}>
                            Verify
                        </button>
                    </div>
                    {didObj ? (
                        <div className="container flex-column">
                            <h4>authD:</h4>
                            <textarea rows="5" defaultValue={didObj?.authDID} />
                        </div>
                    ) : null}
                </div>
            );
        }
        if (mode === 'New') {
            return !didObj ? (
                <div className="container flex-column"></div>
            ) : (
                <div className="container flex-column">
                    <h4>Please keep your mnemonic and private key secuire</h4>
                    <br />
                    <h4>authDID:</h4>
                    <textarea rows="5" defaultValue={didObj?.authDID} />
                    <br />
                    <h4>Mnemonic:</h4>
                    <textarea rows="5" defaultValue={didObj?.mnemonic} />
                    <br />
                    <h4>Private key:</h4>
                    <textarea rows="5" defaultValue={didObj?.privateKey} />
                    <br />
                    <div className="container justify-around">
                        <button className="single" onClick={() => setMode('None')}>
                            back
                        </button>
                    </div>
                </div>
            );
        }
    };
    return (
        <div className="identityContainer">
            {renderMode(mode)}
        </div>
    );
};
