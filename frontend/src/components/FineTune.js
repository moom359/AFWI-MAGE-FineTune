import React, { useState } from 'react';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

function FineTune() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      // TODO: Implement file upload and fine-tuning process
      console.log('Starting fine-tuning with file:', selectedFile.name);
      alert(`Fine-tuning started with file: ${selectedFile.name}`);
    } else {
      alert('Please select a CSV file first.');
    }
  };

  return (
    <div className="fine-tune-container">
      <h2>Fine-Tune Model</h2>
      <p>
        This page allows you to fine-tune a model using your prepared dataset. Here's how to use it:
      </p>
      <ol>
        <li>Select a CSV file containing your fine-tuning dataset.</li>
        <li>Click the "Start Fine-Tuning" button to begin the process.</li>
        <li>Wait for the fine-tuning to complete. This may take some time depending on the size of your dataset.</li>
      </ol>
      <div className="file-upload">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <CloudUploadIcon /> Choose File
        </label>
        {selectedFile && <span className="file-name">{selectedFile.name}</span>}
      </div>
      <button 
        onClick={handleSubmit}
        disabled={!selectedFile}
        className="submit-button"
      >
        Start Fine-Tuning
      </button>
    </div>
  );
}

export default FineTune;