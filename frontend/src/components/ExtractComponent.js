import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExtractComponent.css'; // Make sure to create this CSS file
import CSVPreview from './CSVPreview'; // We'll create this component next
import { Grid, Paper, Button, TextField, Select, MenuItem } from '@material-ui/core';

function ExtractComponent() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [csvFilename, setCsvFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedCsvFile, setSelectedCsvFile] = useState('');

  useEffect(() => {
    fetchFiles(currentFolder);
    fetchCsvFiles();
  }, [currentFolder]);

  const fetchFiles = (folder) => {
    axios.get(`http://localhost:8000/api/files/?folder=${folder}`)
      .then(response => {
        console.log('Fetched files:', response.data);
        setFiles(response.data);
      })
      .catch(error => console.error('Error fetching files:', error));
  };

  const fetchCsvFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/csv-files/');
      setCsvFiles(response.data);
    } catch (error) {
      console.error('Error fetching CSV files:', error);
    }
  };

  const handleFileSelection = (event, filePath) => {
    console.log('File selection changed:', filePath, event.target.checked);
    const fullPath = currentFolder ? `${currentFolder}/${filePath}` : filePath;
    if (event.target.checked) {
      setSelectedFiles(prev => {
        const newSelection = [...prev, fullPath];
        console.log('New selected files:', newSelection);
        return newSelection;
      });
    } else {
      setSelectedFiles(prev => {
        const newSelection = prev.filter(path => path !== fullPath);
        console.log('New selected files:', newSelection);
        return newSelection;
      });
    }
  };

  const handleFolderClick = (folderPath) => {
    console.log('Folder clicked:', folderPath);
    setCurrentFolder(prevFolder => {
      const newFolder = prevFolder ? `${prevFolder}/${folderPath}` : folderPath;
      console.log('New current folder:', newFolder);
      return newFolder;
    });
  };

  const handleBackClick = () => {
    console.log('Back button clicked');
    setCurrentFolder(prevFolder => {
      const parentFolder = prevFolder.split('/').slice(0, -1).join('/');
      console.log('New current folder:', parentFolder);
      return parentFolder;
    });
  };

  const handleExtract = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select at least one file');
      return;
    }

    if (!csvFilename.trim()) {
      setMessage('Please provide a name for the CSV file');
      return;
    }

    setIsLoading(true);
    setMessage('');

    console.log('Extracting files:', selectedFiles);
    try {
      const response = await axios.post('http://localhost:8000/api/extract/', {
        filenames: selectedFiles,
        csv_filename: csvFilename.trim()
      });
      setMessage(`Extraction process completed.\nCSV file created: ${response.data.csv_file}`);
      response.data.results.forEach(result => {
        setMessage(prev => prev + `\n${result.filename}: ${result.status}`);
      });
      fetchCsvFiles(); // Refresh the list of CSV files after extraction
    } catch (error) {
      setMessage('Error extracting content');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const sortedFiles = React.useMemo(() => {
    let sortableFiles = [...files];
    if (sortConfig.key !== null) {
      sortableFiles.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableFiles;
  }, [files, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="extract-container">
      <h2>Extract Content</h2>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper className="extract-section">
            <div className="instructions">
              <h3>Quick Guide:</h3>
              <ol>
                <li>Select files for extraction</li>
                <li>Review selected files</li>
                <li>Name your fine-tuning dataset</li>
                <li>Extract & review the generated CSV below</li>
              </ol>
              <p><small>Supported formats: PDF, DOCX, TXT</small></p>
            </div>

            <h3>Step 1: Select Files for Extraction</h3>
            <p>Current folder: {currentFolder || 'Root'}</p>
            {currentFolder && (
              <Button onClick={handleBackClick} variant="outlined">Back to Parent Folder</Button>
            )}
            
            <div className="file-list">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Upload Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiles.map(file => (
                    <tr key={file.path} className="file-item">
                      <td>
                        {file.type !== 'folder' && (
                          <input
                            type="checkbox"
                            id={file.path}
                            checked={selectedFiles.includes(currentFolder ? `${currentFolder}/${file.path}` : file.path)}
                            onChange={(e) => handleFileSelection(e, file.path)}
                          />
                        )}
                      </td>
                      <td>
                        {file.type === 'folder' ? (
                          <span className="folder" onClick={() => handleFolderClick(file.path)}>{file.name}</span>
                        ) : (
                          <label htmlFor={file.path}>{file.name}</label>
                        )}
                      </td>
                      <td>{file.type}</td>
                      <td>
                        {file.type !== 'folder' && <span className="file-date">{formatDate(file.uploadDate)}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper className="extract-section">
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h3>Step 2: Review Selected Files:</h3>
                <ul>
                  {selectedFiles.map(file => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="csv-filename-input">
              <TextField
                fullWidth
                label="Step 3: Name your Fine-Tuning Dataset"
                helperText="Date will be auto-appended"
                value={csvFilename}
                onChange={(e) => setCsvFilename(e.target.value)}
                variant="outlined"
              />
            </div>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleExtract} 
              disabled={selectedFiles.length === 0 || !csvFilename.trim() || isLoading}
            >
              {isLoading ? 'Extracting...' : `Extract Selected Files (${selectedFiles.length})`}
            </Button>

            {isLoading && <div className="loading-indicator">Extracting content, please wait...</div>}
            {message && <pre className="message">{message}</pre>}
          </Paper>
        </Grid>
      </Grid>

      <Paper className="extract-section csv-preview-container">
        <h3>Preview Extracted Content</h3>
        <Select
          value={selectedCsvFile}
          onChange={(e) => setSelectedCsvFile(e.target.value)}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="">Select a CSV file</MenuItem>
          {csvFiles.map(file => (
            <MenuItem key={file} value={file}>{file}</MenuItem>
          ))}
        </Select>
        {selectedCsvFile && <CSVPreview filename={selectedCsvFile} />}
      </Paper>
    </div>
  );
}

export default ExtractComponent;