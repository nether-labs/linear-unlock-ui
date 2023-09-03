import React, { useState, useRef, useEffect } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import { Button, Typography, Grid } from "@mui/material";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import ERC20ABI from "abi/erc20.json";
import UNLOCK_ABI from "abi/linear-unlock-abi.json";
import useCSVUpload from "hooks/useCSVUpload";
import { csvToWriteData } from "utils";
import { CONTRACT_ADDRESS, TOKEN_ADDRESS } from "contract_constants";

const Upload = () => {
  const inputRef = useRef();
  const { handleUploadCSV, csvUploading, csvData } = useCSVUpload(inputRef);
  const [writeApproveData, setWriteApproveData] = useState<any[]>([]);
  const [writeData, setWriteData] = useState<any[]>([]);

  const submitUsers = async (csvData: any[]) => {
    const [writeData, approveAmount] = csvToWriteData(csvData);

    console.log("writeApproveData", [CONTRACT_ADDRESS, approveAmount]);
    console.log("writeData", writeData);

    setWriteApproveData([CONTRACT_ADDRESS, approveAmount]);
    setWriteData([writeData]);
  };

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
    args: writeData,
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

  useEffect(() => {
    console.log("isApproveSuccess", isApproveSuccess);
    if (isApproveSuccess) {
      console.log("writing addUsers");
      addUsersWrite?.();
    }
  }, [isApproveSuccess]);

  useEffect(() => {
    console.log("writing approve");
    console.log(approveWrite);
    approveWrite?.();
  }, [writeApproveData]);

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
                  key={d.userAddress}
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
        <Button onClick={() => submitUsers(csvData)}>Submit Users</Button>
      )}

      {approveError?.message ||
        (addUsersError?.message && (
          <Grid sx={{ maxWidth: 500 }}>
            <Typography sx={{ color: "orangered", fontSize: 10 }}>
              {approveError?.message}
              {addUsersError?.message}
            </Typography>
          </Grid>
        ))}
    </div>
  );
};

export default Upload;
