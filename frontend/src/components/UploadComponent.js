import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import FileList from './FileList';
import { 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button 
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';

function UploadComponent() {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);

  const fetchUploadedFiles = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/files/?folder=${currentFolder}`);
      console.log('Fetched files:', response.data);
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      setMessage('Error fetching uploaded files. Please try again.');
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.pdf,.docx,.txt',
    multiple: true
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length === 0) {
      setMessage('Please select at least one file');
      return;
    }

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post('http://localhost:8000/api/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessage(`Error uploading ${file.name}: ${error.response?.data?.detail || error.message}`);
        return;
      }
    }

    setMessage('All files uploaded successfully');
    setFiles([]);
    fetchUploadedFiles();
  };

  const deleteUploadedFile = async (filename) => {
    try {
      await axios.delete(`http://localhost:8000/api/files/${filename}`);
      setMessage(`File ${filename} deleted successfully`);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      if (error.response && error.response.status === 404) {
        setMessage(`File ${filename} not found. It may have been already deleted.`);
        fetchUploadedFiles(); // Refresh the list to remove the non-existent file
      } else {
        setMessage(`Error deleting ${filename}: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      const filesToDelete = selectedFiles.filter(filename => 
        uploadedFiles.some(file => file.name === filename)
      );
      console.log('Attempting to delete files:', filesToDelete);
      
      // Log the exact payload being sent
      console.log('Payload:', { filenames: filesToDelete });
      
      const response = await axios.post('http://localhost:8000/api/bulk-delete/', { filenames: filesToDelete });
      
      console.log('Bulk delete response:', response.data);
      setMessage(`Successfully deleted ${response.data.deleted_files.length} files`);
      fetchUploadedFiles();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error deleting files:', error.response?.data || error.message);
      setMessage('Error deleting files. Please try again.');
    }
  };

  const handleBulkDownload = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/bulk-download/', 
        { filenames: selectedFiles },
        { 
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'downloaded_files.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading files:', error);
      setMessage('Error downloading files. Please try again.');
    }
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post('http://localhost:8000/api/create_folder/', {
        name: newFolderName,
        parent_folder: currentFolder
      });
      setMessage(`Folder '${newFolderName}' created successfully`);
      setNewFolderName("");
      setIsCreateFolderDialogOpen(false);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error creating folder:', error);
      setMessage('Error creating folder. Please try again.');
    }
  };

  const handleFolderClick = (folderName) => {
    setCurrentFolder(currentFolder ? `${currentFolder}/${folderName}` : folderName);
    setSelectedFiles([]); // Clear selected files when navigating to a new folder
  };

  const handleBackClick = useCallback(() => {
    const parentFolder = currentFolder.split('/').slice(0, -1).join('/');
    setCurrentFolder(parentFolder);
    setSelectedFiles([]); // Clear selected files when navigating back
  }, [currentFolder]);

  const handleRenameFolder = async (oldName, newName) => {
    try {
      await axios.post('http://localhost:8000/api/rename_folder/', {
        old_name: oldName,
        new_name: newName,
        parent_folder: currentFolder
      });
      setMessage(`Folder '${oldName}' renamed to '${newName}' successfully`);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error renaming folder:', error);
      setMessage('Error renaming folder. Please try again.');
    }
  };

  const handleDeleteFolder = async (folderName) => {
    try {
      await axios.delete(`http://localhost:8000/api/delete_folder/${currentFolder ? `${currentFolder}/` : ''}${folderName}`);
      setMessage(`Folder '${folderName}' deleted successfully`);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error deleting folder:', error);
      setMessage('Error deleting folder. Please try again.');
    }
  };

  const handleRenameFile = async (oldName, newName) => {
    try {
      await axios.post('http://localhost:8000/api/rename_file/', {
        old_name: oldName,
        new_name: newName,
        folder: currentFolder
      });
      setMessage(`File '${oldName}' renamed to '${newName}' successfully`);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error renaming file:', error);
      setMessage('Error renaming file. Please try again.');
    }
  };

  const handleMoveFile = async (file, targetFolder) => {
    try {
      const sourcePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;
      const targetPath = targetFolder.name === '..' 
        ? currentFolder.split('/').slice(0, -1).join('/') 
        : currentFolder 
          ? `${currentFolder}/${targetFolder.name}`
          : targetFolder.name;
      
      console.log('Moving file:', { sourcePath, targetPath, file, targetFolder });

      const response = await axios.post('http://localhost:8000/api/move-file/', {
        file_path: sourcePath,
        target_folder: targetPath
      });
      console.log('Move file response:', response.data);
      setMessage(`File '${file.name}' moved successfully`);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error moving file:', error.response?.data || error);
      setMessage(`Error moving file: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Documents</h2>
      <p>
        Here you can upload your documents for fine-tuning. Follow these steps:
      </p>
      <ol>
        <li>Drag and drop files into the designated area, or click to select files.</li>
        <li>You can select multiple PDF, DOCX, or TXT files.</li>
        <li>Add more files by dropping them in the same area or clicking to select more.</li>
        <li>Click the "Upload" button to send the files to our server.</li>
      </ol>
      <p>
        Supported file formats: PDF, DOCX, TXT. Maximum file size: 100MB per file.
      </p>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
      {files.length > 0 && (
        <div>
          <h4>Selected Files:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleSubmit}>Upload</button>
      {message && <p className="message">{message}</p>}
      
      <div style={{ position: 'relative', marginBottom: '-5px' , marginTop: '25px'}}>
        <div style={{ 
          position: 'absolute', 
          right: 0, 
          top: 0,
          display: 'flex'
        }}>
          <Tooltip title="Delete Selected">
            <span>
              <IconButton
                onClick={handleBulkDelete}
                disabled={selectedFiles.length === 0}
                style={{ 
                  color: selectedFiles.length === 0 ? 'rgba(0, 0, 0, 0.26)' : '#2196f3',
                  backgroundColor: 'transparent' 
                }}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Download Selected">
            <span>
              <IconButton
                onClick={handleBulkDownload}
                disabled={selectedFiles.length === 0}
                style={{ 
                  color: selectedFiles.length === 0 ? 'rgba(0, 0, 0, 0.26)' : '#2196f3',
                  backgroundColor: 'transparent' 
                }}
              >
                <GetAppIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Create Folder">
            <IconButton
              onClick={() => setIsCreateFolderDialogOpen(true)}
              style={{ color: '#2196f3', backgroundColor: 'transparent' }}
            >
              <CreateNewFolderIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      
      <FileList
        files={uploadedFiles}
        onDelete={deleteUploadedFile}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        onFolderClick={handleFolderClick}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        onRenameFile={handleRenameFile}
        onMoveFile={handleMoveFile}
        currentFolder={currentFolder}
        onNavigateUp={handleBackClick}
      />

      <Dialog open={isCreateFolderDialogOpen} onClose={() => setIsCreateFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateFolderDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateFolder} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UploadComponent;