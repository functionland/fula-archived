import { useEffect, useState } from "react";
import {
  VStack,
  useDisclosure,
  Button,
  Text,
  HStack,
  Select,
  Input,
  Box
} from "@chakra-ui/react";
import SelectWalletModal from "./Modal";
import { useWeb3React } from "@web3-react/core";
import { FulaDID } from '@functionland/fula-sec';
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { connectors } from "../utils/connectors";
import { toHex, truncateAddress } from "../utils";

export default function Wallet({onDIDSet}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    library,
    chainId,
    account,
    activate,
    deactivate,
    active
  } = useWeb3React();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();
  const [authDid,setAuthDid] = useState(null)

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }]
      });
    } catch (switchError) {
    //   if (switchError.code === 4902) {
    //     try {
    //       await library.provider.request({
    //         method: "wallet_addEthereumChain",
    //         params: [networkParams[toHex(network)]]
    //       });
    //     } catch (error) {
          setError(error);
    //     }
    //   }
    }
  };

  const createDID = async () => {
    let didObj = null;
    
    try {
      const DID = new FulaDID();
      didObj = await DID.create(signature, message)
      
      setAuthDid(didObj)
      onDIDSet(DID)
    } catch (error) {
      alert(error);
    }
  }

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: [message, account]
      });
      setSignedMessage(message);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);

  useEffect(() => {
    if(!signature || !message) return
    if(authDid) return

    createDID()
  },[signature, message])

  return (
    <>
      <VStack justifyContent="center" alignItems="center">
        <HStack>
          {!active ? (
            <Button onClick={onOpen}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text color="white">{`Connection Status: `}</Text>
            {active ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>
          <Tooltip label={account} placement="right">
            <Text color="white">{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text color="white">{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
          <Text color="white">{`Auth ID: ${authDid ? authDid.authDID : "No Did applied"}`}</Text>
        </VStack>
        {active && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={switchNetwork} isDisabled={!network}>
                  Switch Network
                </Button>
                <Select placeholder="Select network" onChange={handleNetwork} color="gray">
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                  <option value="42">Kovan</option>
                </Select>
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={signMessage} isDisabled={!message}>
                  Sigin
                </Button>
                <Input
                  placeholder="Set Password"
                  maxLength={20}
                  onChange={handleInput}
                  w="140px"
                  color="white"
                />
                {signature ? (
                  <Tooltip label={signature} placement="bottom">
                    <Text color="white">{`Signature: ${truncateAddress(signature)}`}</Text>
                  </Tooltip>
                ) : null}
              </VStack>
            </Box>
          </HStack>
        )}
        <Text color="white">{error ? error.message : null}</Text>
      </VStack>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </>
  );
}
