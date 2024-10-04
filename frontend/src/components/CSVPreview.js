import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@material-ui/core';

function CSVPreview({ filename }) {
  const [csvData, setCsvData] = useState([]);
  const [stats, setStats] = useState({ totalRows: 0 });

  useEffect(() => {
    fetchCsvData();
  }, [filename]);

  const fetchCsvData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/csv-preview/${filename}`);
      setCsvData(response.data);
      setStats({ totalRows: response.data.length });
    } catch (error) {
      console.error('Error fetching CSV data:', error);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        CSV File Statistics
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total Rows: {stats.totalRows}
      </Typography>
      <TableContainer component={Paper} style={{ maxHeight: 400, overflow: 'auto' }}>
        <Table stickyHeader aria-label="csv preview table">
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Security Classification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {csvData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.question}</TableCell>
                <TableCell>{row.answer}</TableCell>
                <TableCell>{row.source}</TableCell>
                <TableCell>{row.security_classification}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default CSVPreview;