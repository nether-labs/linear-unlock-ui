import { erc20ABI, readContract } from "@wagmi/core";
import { CONTRACT_ADDRESS, TOKEN_ADDRESS } from "contract_constants";
import { useEffect, useState } from "react";
import { useAccount, usePrepareContractWrite } from "wagmi";

const useTokenAllowance = (spenderAddress: string) => {
  const [allowance, setAllowance] = useState<bigint>(0n);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    getAllowance();
  }, []);

  const getAllowance = async () => {
    if (!isConnected) return;
    const args = [<`0x${string}`>address, <`0x${string}`>spenderAddress];
    try {
      const _allowance = await readContract({
        address: TOKEN_ADDRESS,
        abi: erc20ABI,
        functionName: "allowance",
        args: args as any,
      });

      console.log("_allowance", _allowance);
      setAllowance(_allowance as bigint);
    } catch (error) {
      console.log(error);
      setAllowance(0n);
    }
  };

  return { allowance };
};

export default useTokenAllowance;
