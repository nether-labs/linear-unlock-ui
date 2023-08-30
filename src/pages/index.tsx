import { Grid, Typography, Button } from "@mui/material";
import * as React from "react";
import { Web3Button } from "@web3modal/react";

import UploadCSV from "../components/UploadCSV";
import useVestingContract from "@/hooks/useVestingContract";
import Claim from "@/components/Claim";

export default function Home() {
  const {
    userIsOwner,
    userClaimableAmount,
    userTotalClaimedAmount,
    userTotalVestedAmount,
    userEndVestTimestamp,
  } = useVestingContract();

  return (
    <>
      <Grid container justifyContent="end" sx={{ p: 2 }}>
        <Web3Button />
      </Grid>

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
        sx={{ p: 10 }}
      >
        {userIsOwner && (
          <Grid sx={{ mb: 5 }}>
            <UploadCSV />
          </Grid>
        )}

        <Claim
          userClaimableAmount={userClaimableAmount}
          userTotalClaimedAmount={userTotalClaimedAmount}
          userTotalVestedAmount={userTotalVestedAmount}
          userEndVestTimestamp={userEndVestTimestamp}
        />
      </Grid>
    </>
  );
}
