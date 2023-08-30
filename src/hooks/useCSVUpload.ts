import React, { useState } from "react";
import Papa from "papaparse";

const useCSVUpload = (inputRef: React.MutableRefObject<undefined>) => {
  const [uploading, setUploading] = useState(false);
  const [csvData, setCsvData] = useState([]);

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

  return {
    csvUploading: uploading,
    csvData,
    handleUploadCSV,
  };
};

export default useCSVUpload;
