import { Grid, Typography, Button } from "@mui/material";
import * as React from "react";

import { CONTRACT_ADDRESS, DECIMALS } from "@/constants";
import { weiToLocaleString } from "@/utils";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import UNLOCK_ABI from "@/abi/linear-unlock-abi.json";

interface IClaimProps {
  userClaimableAmount: bigint;
  userTotalClaimedAmount: bigint;
  userTotalVestedAmount: bigint;
  userEndVestTimestamp: number;
}

const Claim: React.FC<IClaimProps> = (props) => {
  // === CLAIM CONFIG === //
  const {
    config: claimConfig,
    error: claimPrepareError,
    isError: isClaimPrepareError,
  } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: UNLOCK_ABI,
    functionName: "claim",
  });

  const {
    data: claimData,
    write: claimWrite,
    error: claimError,
    isError: isClaimError,
  } = useContractWrite(claimConfig);
  const { isLoading: isClaimLoading, isSuccess: isSuccessLoading } =
    useWaitForTransaction({
      hash: claimData?.hash,
    });

  // console.log("claimWrite", claimWrite);

  return (
    <>
      <Grid item xs={12}>
        <Typography>
          Total Vested:{" "}
          {weiToLocaleString(props.userTotalVestedAmount, DECIMALS)}
        </Typography>
        <Typography>
          Vest ends: {new Date(props.userEndVestTimestamp).toString()}
        </Typography>
        <Typography>
          Claimed so far:{" "}
          {weiToLocaleString(props.userTotalClaimedAmount, DECIMALS)}
        </Typography>
        <Typography>
          Claimable: {weiToLocaleString(props.userClaimableAmount, DECIMALS)}
        </Typography>
      </Grid>
      <Grid item sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={() => claimWrite?.()}
          disabled={props.userClaimableAmount === 0n}
        >
          Claim
        </Button>
      </Grid>
    </>
  );
};

export default Claim;
