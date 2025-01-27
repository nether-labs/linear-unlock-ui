import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import {
  useAccount,
  useBlockNumber,
  useChainId,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";

import UNLOCK_ABI from "abi/linear-unlock-abi.json";
import { CONTRACT_ADDRESS, SCALAR } from "contract_constants";

export type User = [string, bigint, bigint, bigint, bigint];

const DESIRED_CHAIN_ID = 8453; // base mainnet
// const DESIRED_CHAIN_ID = 84531; // base goerli

const useVestingContract = () => {
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  // owner data
  const [owner, setOwner] = useState("");
  const [userIsOwner, setUserIsOwner] = useState(false);

  // user data
  const [userClaimableAmount, setUserClaimableAmount] = useState(0n);
  const [userTotalClaimedAmount, setUserTotalClaimedAmount] = useState(0n);
  const [userTotalVestedAmount, setUserTotalVestedAmount] = useState(0n);
  const [userEndVestTimestamp, setUserEndVestTimestamp] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const [desiredChain, setDesiredChain] = useState(false);
  const [blockNumber, setBlockNumber] = useState(0n);
  const [previousBlockNumber, setPreviousBlockNumber] = useState(0n);

  const { address, isConnected } = useAccount();
  const { switchNetwork } = useSwitchNetwork({
    chainId: DESIRED_CHAIN_ID,
  });
  const { chain } = useNetwork();
  const { data } = useBlockNumber({
    watch: true,
    onBlock(blockNumber) {
      // console.log("blockNumber", blockNumber);
      setBlockNumber(blockNumber);
    },
  });

  useEffect(() => {
    console.log({ data });
  }, [data]);

  useEffect(() => {
    if (!isConnected) return;
    if (chain.id !== DESIRED_CHAIN_ID) return;

    console.log("Getting initial data");
    getInitialData();

    // // update claimable amount periodically (5s)
    // const interval = setInterval(updateUser, 5000);
    // return () => clearInterval(interval);
  }, [isConnected, chain, address]);

  useEffect(() => {
    if (!chain) return;
    console.log("chainId", chain.id);
    setDesiredChain(chain.id === DESIRED_CHAIN_ID);
  }, [chain]);

  // useEffect(() => {
  //   if (!initialDataLoaded) return;

  //   // if new blocknumber ishigher thn previous, update user
  //   if (blockNumber > previousBlockNumber) {
  //     // updateUser();
  //     console.log("updating user at block", blockNumber);
  //     updateUser().then(() => setPreviousBlockNumber(blockNumber));
  //   }
  // }, [blockNumber, initialDataLoaded]);

  const switchChain = () => {
    if (!switchNetwork) return;
    switchNetwork?.(DESIRED_CHAIN_ID);
  };

  const getInitialData = async () => {
    await Promise.all([_getOwner(), _getUser()]);
    setInitialDataLoaded(true);
  };

  const _getOwner = async () => {
    const _owner = await readContract({
      address: CONTRACT_ADDRESS,
      abi: UNLOCK_ABI,
      functionName: "owner",
    });

    setOwner(_owner as string);
    setUserIsOwner(_owner === address);
  };

  const _getUser = async () => {
    const _user = (await readContract({
      address: CONTRACT_ADDRESS,
      abi: UNLOCK_ABI,
      functionName: "users",
      args: [address],
    })) as User;

    // console.log(_user);

    if (_user.length > 0) {
      setUserTotalVestedAmount(BigInt(_user[2]) / SCALAR);
      setUserTotalClaimedAmount(BigInt(_user[1]) / SCALAR);
      setUserEndVestTimestamp(Number(_user[4]) * 1000);
      updateUser();
    }
  };

  const updateUser = async () => {
    if (!address) return;

    try {
      setUpdating(true);
      const _userClaimable = (await readContract({
        address: CONTRACT_ADDRESS,
        abi: UNLOCK_ABI,
        functionName: "getUserClaimable",
        args: [address],
      })) as bigint;
      setUserClaimableAmount(_userClaimable / SCALAR);
    } catch (error) {
      console.log(error);
    } finally {
      setUpdating(false);
    }
  };

  // dev logging
  useEffect(() => {
    if (updating) return;
    // console.log("user", address);
    // console.log("isOwner", userIsOwner);
    // console.log("userClaimableAmount", userClaimableAmount);
    // console.log("userTotalClaimedAmount", userTotalClaimedAmount);
    // console.log("userTotalVestedAmount", userTotalVestedAmount);
    // console.log("userEndVestTimestamp", userEndVestTimestamp);
  }, [updating]);

  return {
    owner,
    userIsOwner,
    userClaimableAmount,
    userTotalClaimedAmount,
    userTotalVestedAmount,
    userEndVestTimestamp,
    updateUser,
    switchChain,
    desiredChain,
    blockNumber,
  };
};

export default useVestingContract;
