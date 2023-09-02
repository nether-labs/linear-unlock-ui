import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import UNLOCK_ABI from "abi/linear-unlock-abi.json";
import { CONTRACT_ADDRESS, SCALAR } from "constants";

export type User = [string, bigint, bigint, bigint, bigint];

const useVestingContract = () => {
  // owner data
  const [owner, setOwner] = useState("");
  const [userIsOwner, setUserIsOwner] = useState(false);

  // user data
  const [userClaimableAmount, setUserClaimableAmount] = useState(0n);
  const [userTotalClaimedAmount, setUserTotalClaimedAmount] = useState(0n);
  const [userTotalVestedAmount, setUserTotalVestedAmount] = useState(0n);
  const [userEndVestTimestamp, setUserEndVestTimestamp] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) return;
    console.log("Getting initial data");
    getInitialData();

    // update claimable amount periodically (5s)
    const interval = setInterval(updateUser, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getInitialData = async () => {
    _getOwner();
    _getUser();
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
  };
};

export default useVestingContract;
