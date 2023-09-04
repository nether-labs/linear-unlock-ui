import React, { useState, useRef, useEffect, useCallback } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import { Button, Typography, Grid, Stack } from "@mui/material";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import ERC20ABI from "abi/erc20.json";
import UNLOCK_ABI from "abi/linear-unlock-abi.json";
import useCSVUpload from "hooks/useCSVUpload";
import {
  CONTRACT_ADDRESS,
  DECIMALS,
  TOKEN_ADDRESS,
  START_VEST_TIMESTAMP,
} from "contract_constants";
import { weiToLocaleString } from "utils";
import useTokenAllowance from "hooks/useTokenAllowance";

const csvToWriteData = (csvData: any[]): [any[], bigint] => {
  let approveAmount = BigInt(0);

  const userData = csvData.reduce((acc, curr) => {
    const { userAddress, claimable, vestMonths } = curr;
    const claimableAmount = BigInt(claimable) * BigInt(10 ** DECIMALS);
    approveAmount += claimableAmount;
    const endVestTimestamp =
      START_VEST_TIMESTAMP + Number(vestMonths * 60 * 60 * 24 * 30);

    // if user already exists, add to their claimable amount
    if (acc[userAddress]) {
      acc[userAddress].claimable += claimableAmount;
      return acc;
    }

    return {
      ...acc,
      [userAddress]: {
        userAddress,
        claimed: BigInt(0),
        claimable: claimableAmount,
        lastClaimedTimestamp: 0,
        endVestTimestamp,
      },
    };
  }, {});

  // convert object to array
  const writeData = Object.values(userData);
  return [writeData, approveAmount];
};

const Upload = () => {
  const inputRef = useRef();
  const { handleUploadCSV, csvUploading, csvData } = useCSVUpload(inputRef);
  const [writeApproveData, setWriteApproveData] = useState<any[]>([]);
  const [writeData, setWriteData] = useState<any[]>([]);
  const { allowance } = useTokenAllowance(CONTRACT_ADDRESS);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    if (!csvData.length) return;
    const [userData, amount] = csvToWriteData(csvData);
    setWriteApproveData([CONTRACT_ADDRESS, amount]);
    setWriteData(userData);
  }, [csvData]);

  useEffect(() => {
    if (!writeApproveData.length) return;
    console.log("canSubmit", writeApproveData[1] <= allowance);
    console.log("writeData", writeData);
    if (allowance <= 0n) return;

    setCanSubmit(writeApproveData[1] <= allowance);
  }, [allowance, writeApproveData]);

  // === APPROVE CONFIG === //
  const {
    config: approveConfig,
    error: approvePrepareError,
    isError: isApprovePrepareError,
  } = usePrepareContractWrite({
    address: TOKEN_ADDRESS,
    abi: ERC20ABI,
    functionName: "approve",
    args: writeApproveData,
  });

  const {
    data: approveTxData,
    write: approveWrite,
    error: approveError,
    isError: isApproveError,
  } = useContractWrite(approveConfig);

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } =
    useWaitForTransaction({
      hash: approveTxData?.hash,
    });

  // === WRITE CONFIG === //
  const {
    config: addUsersConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: UNLOCK_ABI,
    functionName: "addUsers",
    args: [writeData],
  });

  const {
    data: addUsersTxData,
    write: addUsersWrite,
    error: addUsersError,
    isError: isAddUsersError,
  } = useContractWrite(addUsersConfig);

  const { isLoading: isAddUsersLoading, isSuccess: isAddUsersSuccess } =
    useWaitForTransaction({
      hash: addUsersTxData?.hash,
    });

  // useEffect(() => {
  //   console.log("isApproveSuccess", isApproveSuccess);
  //   if (isApproveSuccess) {
  //     console.log("writing addUsers");
  //     addUsersWrite?.();
  //   }
  // }, [isApproveSuccess]);

  // useEffect(() => {
  //   console.log("isPrepareError", isPrepareError);
  //   console.log("prepareError", prepareError);
  // }, [prepareError]);

  const approve = async () => {
    if (!approveWrite) return;
    if (!writeApproveData.length || !writeData.length) return;
    console.log("writing approve");
    approveWrite?.();
  };

  const submit = async () => {
    if (!canSubmit) return;
    if (!writeApproveData.length || !writeData.length) return;
    console.log("isAddUsersError", isAddUsersError);
    if (isAddUsersError) {
      console.log("addUsersError", addUsersError);
      return;
    }

    console.log("writing addUsers");
    console.log(writeData);
    addUsersWrite?.();
  };

  return (
    <div>
      <h4 className="page-header mb-4">Upload a CSV</h4>
      <div className="mb-4">
        <input
          ref={inputRef}
          disabled={csvUploading}
          type="file"
          className="form-control"
        />
      </div>
      <button
        onClick={handleUploadCSV}
        disabled={csvUploading}
        className="btn btn-primary"
      >
        {csvUploading ? "Uploading..." : "Upload"}
      </button>

      {csvData.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="right">userAddress</TableCell>
                <TableCell align="right">claimable</TableCell>
                <TableCell align="right">vestMonths</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {csvData.map((d) => (
                <TableRow
                  key={`${d.userAddress}-${d.claimable}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {d.userAddress}
                  </TableCell>
                  <TableCell align="right">{d.claimable}</TableCell>
                  <TableCell align="right">{d.vestMonths}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {isAddUsersLoading || isApproveLoading ? (
        <CircularProgress />
      ) : (
        <Stack direction={"row"} gap={2}>
          <Button onClick={() => approve()}>Approve Tokens</Button>
          <Button onClick={() => submit()} disabled={!canSubmit}>
            Submit Users
          </Button>
        </Stack>
      )}

      {writeData.length > 0 && (
        <Stack direction={"row"} gap={2}>
          <Typography>Total tokens</Typography>
          <Typography>
            {weiToLocaleString(writeApproveData[1], DECIMALS)}
          </Typography>
        </Stack>
      )}

      <Stack direction={"column"}>
        <Stack direction="row" gap={2}>
          <Typography>Approved?</Typography>
          <Typography>{isApproveSuccess ? "Yes" : "No"}</Typography>
        </Stack>
        <Stack direction="row" gap={2}>
          <Typography>Added Users?</Typography>
          <Typography>{isAddUsersSuccess ? "Yes" : "No"}</Typography>
        </Stack>
      </Stack>

      {approveError?.message ||
        (addUsersError?.message && (
          <Grid sx={{ maxWidth: 500 }}>
            <Typography sx={{ color: "orangered", fontSize: 10 }}>
              {approveError?.message}
            </Typography>
            <Typography sx={{ color: "orangered", fontSize: 10 }}>
              {addUsersError?.message}
            </Typography>
          </Grid>
        ))}
    </div>
  );
};

export default Upload;
