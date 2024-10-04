import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExtractComponent() {
  // Debugging: Add a console log to check if the component is rendering
  console.log('Rendering ExtractComponent');

  // Comment out the existing state and useEffect
  /*
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the list of uploaded files
    axios.get('http://localhost:8000/api/files/')
      .then(response => setFiles(response.data))
      .catch(error => console.error('Error fetching files:', error));
  }, []);

  const handleExtract = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/extract/${selectedFile}`);
      setMessage(response.data.status);
    } catch (error) {
      setMessage('Error extracting content');
      console.error('Error:', error);
    }
  };
  */

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the list of uploaded files
    axios.get('http://localhost:8000/api/files/')
      .then(response => {
        console.log('Fetched files:', response.data);
        setFiles(response.data.filter(file => file.type === 'file'));
      })
      .catch(error => console.error('Error fetching files:', error));
  }, []);

  const handleExtract = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/extract/${selectedFile}`);
      setMessage(response.data.status);
    } catch (error) {
      setMessage('Error extracting content');
      console.error('Error:', error);
    }
  };

  return (
    <div className="extract-container">
      <h2>Extract Content</h2>
      <p>This is the extraction page. Content extraction functionality is currently being debugged.</p>
      
      {/* Debugging: Add a simple element to verify rendering */}
      <div style={{color: 'red'}}>Debug: ExtractComponent is rendering</div>

      {/* Comment out the existing JSX
      <p>
        This page allows you to extract content from your uploaded documents. Here's how to use it:
      </p>
      <ol>
        <li>Select a file from the dropdown menu below. This list shows all the files you've uploaded.</li>
        <li>Click the "Extract" button to start the content extraction process.</li>
        <li>Wait for the process to complete. You'll see a success message when it's done.</li>
      </ol>
      <p>
        After extraction, you can review and edit the content in the Review section.
      </p>
      <div>
        <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
          <option value="">Select a file</option>
          {files.map(file => (
            <option key={file} value={file}>{file}</option>
          ))}
        </select>
        <button onClick={handleExtract}>Extract</button>
      </div>
      {message && <p className="message">{message}</p>}
      */}
      <p>
        This page allows you to extract content from your uploaded documents. Here's how to use it:
      </p>
      <ol>
        <li>Select a file from the dropdown menu below. This list shows all the files you've uploaded.</li>
        <li>Click the "Extract" button to start the content extraction process.</li>
        <li>Wait for the process to complete. You'll see a success message when it's done.</li>
      </ol>
      <p>
        After extraction, you can review and edit the content in the Review section.
      </p>
      <div>
        <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
          <option value="">Select a file</option>
          {files.map(file => (
            <option key={file.path} value={file.path}>{file.name}</option>
          ))}
        </select>
        <button onClick={handleExtract}>Extract</button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ExtractComponent;