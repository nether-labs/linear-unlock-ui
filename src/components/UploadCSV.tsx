import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
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
import { readContract } from "@wagmi/core";
import abi from "../abi/linear-unlock-abi.json";
import tokenAbi from "../abi/erc20.json";

const Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [writeData, setWriteData] = useState([]);
  const [writeApproveData, setWriteApproveData] = useState([]);
  const inputRef = useRef();

  const handleUploadCSV = () => {
    setUploading(true);

    const input = inputRef?.current;
    const reader = new FileReader();
    //@ts-ignore
    const [file] = input.files;

    reader.onloadend = ({ target }) => {
      //@ts-ignore
      const csv = Papa.parse(target.result, { header: true });
      //@ts-ignore
      setCsvData(csv?.data);

      console.log("csv", csv);
    };

    reader.readAsText(file);
    setUploading(false);
  };

  ///////////////////
  const {
    config: approveConfig,
    error: approvePrepareError,
    isError: isApprovePrepareError,
  } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
    abi: tokenAbi,
    functionName: "approve",
    args: writeApproveData,
  });

  const {
    data: approveTxData,
    write: writeApprove,
    error: approveError,
    isError: isApproveError,
  } = useContractWrite(approveConfig);

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } =
    useWaitForTransaction({
      hash: approveTxData?.hash,
    });

  ///////////////////
  const {
    config: addUsersConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: abi,
    functionName: "addUsers",
    args: writeData,
  });

  const {
    data: addUsersTxData,
    write,
    error,
    isError,
  } = useContractWrite(addUsersConfig);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: addUsersTxData?.hash,
  });

  ///////////////////

  const submitUsers = async () => {
    const decimals = (await readContract({
      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
      abi: tokenAbi,
      functionName: "decimals",
    })) as number;

    console.log("decimals", decimals);

    let _writeData = [];
    let approveAmount = BigInt(0);
    csvData.forEach((d) => {
      let usrObj = {
        userAddress: "",
        claimed: BigInt(0),
        claimable: BigInt(0),
        lastClaimedTimestamp: 0,
        endVestTimestamp: 0,
      };
      usrObj.userAddress = d.userAddress;
      usrObj.claimable = BigInt(d.claimable) * BigInt(10 ** decimals);
      approveAmount += usrObj.claimable;
      usrObj.endVestTimestamp = Date.now() + Number(d.vestMonths * 2592000);
      _writeData.push(usrObj);
    });

    console.log("writeApproveData", [
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      approveAmount,
    ]);
    setWriteApproveData([
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      approveAmount,
    ]);

    let temp = [];
    temp.push(_writeData);
    setWriteData(temp);

    console.log(writeData);
  };

  useEffect(() => {
    console.log("isApproveSuccess", isApproveSuccess);
    if (isApproveSuccess) {
      console.log("writing addUsers");
      write?.();
    }
  }, [isApproveSuccess]);

  useEffect(() => {
    console.log("writing approve");
    writeApprove?.();
  }, [writeApproveData]);

  return (
    <div>
      <h4 className="page-header mb-4">Upload a CSV</h4>
      <div className="mb-4">
        <input
          ref={inputRef}
          disabled={uploading}
          type="file"
          className="form-control"
        />
      </div>
      <button
        onClick={handleUploadCSV}
        disabled={uploading}
        className="btn btn-primary"
      >
        {uploading ? "Uploading..." : "Upload"}
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

      {isLoading || isApproveLoading ? (
        <CircularProgress />
      ) : (
        <Button onClick={() => submitUsers()}>Submit Users</Button>
      )}

      {error?.message && (
        <Grid sx={{ maxWidth: 500 }}>
          <Typography sx={{ color: "orangered", fontSize: 10 }}>
            {error?.message}
          </Typography>
        </Grid>
      )}
    </div>
  );
};

Upload.propTypes = {};

export default Upload;
