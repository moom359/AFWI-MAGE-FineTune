import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import FileList from './FileList';
import FilePreview from './FilePreview';
import { 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogContentText,
  TextField, 
  Button,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import InfoIcon from '@material-ui/icons/Info';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { makeStyles } from '@material-ui/core/styles';
import './UploadComponent.css';

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  infoIcon: {
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  listItemIcon: {
    minWidth: 36,
  },
  listItemText: {
    margin: 0,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
}));

function UploadComponent() {
  const classes = useStyles();
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

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

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

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
      const filePath = currentFolder ? `${currentFolder}/${filename}` : filename;
      const encodedFilePath = encodeURIComponent(filePath);
      await axios.delete(`http://localhost:8000/api/files/${encodedFilePath}`);
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

  const openBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const closeBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(false);
  };

  const handleBulkDelete = async () => {
    try {
      const filesToDelete = selectedFiles.map(filename => 
        currentFolder ? `${currentFolder}/${filename}` : filename
      );
      console.log('Attempting to delete files:', filesToDelete);
      
      const response = await axios.post('http://localhost:8000/api/bulk-delete/', { filenames: filesToDelete });
      
      console.log('Bulk delete response:', response.data);
      setMessage(`Successfully deleted ${response.data.deleted_files.length} files`);
      fetchUploadedFiles();
      setSelectedFiles([]);
      closeBulkDeleteDialog();
    } catch (error) {
      console.error('Error deleting files:', error.response?.data || error.message);
      setMessage('Error deleting files. Please try again.');
    }
  };

  const handleBulkDownload = async () => {
    try {
      const filesToDownload = selectedFiles.map(filename => 
        currentFolder ? `${currentFolder}/${filename}` : filename
      );
      console.log('Attempting to download files:', filesToDownload);
      
      const response = await axios.post('http://localhost:8000/api/bulk-download/', 
        { filenames: filesToDownload, current_folder: currentFolder },
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'downloaded_files.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage(`Successfully downloaded ${selectedFiles.length} items`);
    } catch (error) {
      console.error('Error downloading files:', error);
      setMessage(`Error downloading files: ${error.response?.data?.detail || error.message}`);
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
      console.log('Renaming file:', { oldName, newName, currentFolder });
      const folderPath = currentFolder ? currentFolder.replace(/\\/g, '/') : '';
      console.log('Constructed folder path:', folderPath);
      
      const requestData = {
        old_name: oldName,
        new_name: newName,
        folder: folderPath
      };
      console.log('Sending rename request with data:', requestData);
      
      const response = await axios.post('http://localhost:8000/api/rename_file/', requestData);
      console.log('Rename response:', response.data);
      
      setMessage(`File '${oldName}' renamed to '${newName}' successfully`);
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error renaming file:', error);
      setMessage(`Error renaming file: ${error.response?.data?.detail || error.message}`);
    }
  };

  const openRenameDialog = (file) => {
    setFileToRename(file);
    setNewFileName(file.name);
    setIsRenameDialogOpen(true);
  };

  const closeRenameDialog = () => {
    setIsRenameDialogOpen(false);
    setFileToRename(null);
    setNewFileName("");
  };

  const confirmRename = () => {
    if (fileToRename && newFileName) {
      handleRenameFile(fileToRename.name, newFileName);
      closeRenameDialog();
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

  const handleUpdateSecurity = async (filename, newSecurity) => {
    try {
      const filePath = currentFolder ? `${currentFolder}/${filename}` : filename;
      await axios.post('http://localhost:8000/api/update-security/', {
        filename: filePath,
        security_classification: newSecurity
      });
      setMessage(`Security classification for ${filename} updated to ${newSecurity}`);
      
      // Update local state
      setUploadedFiles(prevFiles => 
        prevFiles.map(file => 
          file.name === filename 
            ? {...file, securityClassification: newSecurity} 
            : file
        )
      );
      fetchUploadedFiles(); // Refresh the file list to ensure we have the latest data
    } catch (error) {
      console.error('Error updating security classification:', error);
      setMessage(`Error updating security classification: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
  };

  const isFolderSelected = selectedFiles.some(file => uploadedFiles.find(f => f.name === file && f.type === 'folder'));

  const handleFileUpdate = (filePath) => {
    // Refresh the file list or update the specific file in the state
    fetchUploadedFiles();
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const bestPractices = [
    "Remove extraneous pages: Delete cover pages, table of contents, indexes, and other non-essential content.",
    "Save in a compatible format: Ensure your document is saved in a format that supports text extraction (e.g., searchable PDF, DOCX, or TXT).",
  ];

  return (
    <div className="upload-container">
      <h2>Upload & Manage Documents</h2>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
            <div className={classes.titleContainer}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Tooltip title="Best Practices for Document Preparation">
                <IconButton className={classes.infoIcon} onClick={handleOpenDialog}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </div>
            <ol>
              <li>Drag and drop files or click to select files.</li>
              <li>You can select multiple PDF, DOCX, or TXT files.</li>
              <li>Remove any files you didn't intend to upload.</li>
              <li>Click "Upload" to make documents available for extraction.</li>
            </ol>
            <Typography variant="body2" style={{ marginTop: '10px', marginBottom: '20px' }}>
              Supported file formats: PDF, DOCX, TXT. Maximum file size: 100MB per file.
            </Typography>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <p>Drop the files here ...</p> :
                  <p>Drag 'n' drop some files here, or click to browse for files</p>
              }
            </div>
            {files.length > 0 && (
              <div>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Files:
                </Typography>
                <List>
                  {files.map((file, index) => (
                    <ListItem key={index} style={{ padding: '0px' }}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item xs={10}>
                          <ListItemText 
                            primary={file.name} 
                            style={{ 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }} 
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              </div>
            )}
            <div className="upload-button-container">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit} 
                className="upload-button"
              >
                Upload
              </Button>
            </div>
            {message && <p className="message">{message}</p>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
            <FileList
              files={uploadedFiles}
              onDelete={deleteUploadedFile}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              onFolderClick={handleFolderClick}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onRenameFile={openRenameDialog}
              onMoveFile={handleMoveFile}
              currentFolder={currentFolder}
              onNavigateUp={handleBackClick}
              onUpdateSecurity={handleUpdateSecurity}
              onPreviewFile={handlePreviewFile}
              onBulkDelete={openBulkDeleteDialog}
              onBulkDownload={handleBulkDownload}
              onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
            />
          </Paper>
          
          {/* File Preview container */}
          <Paper style={{ padding: '20px', backgroundColor: '#f5f5f5', height: 'calc(100vh - 200px)' }}>
            {previewFile ? (
              <FilePreview file={previewFile} onFileUpdate={handleFileUpdate} />
            ) : (
              <Typography>
                Select a file to preview its contents.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

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

      <Dialog open={isRenameDialogOpen} onClose={closeRenameDialog}>
        <DialogTitle>Rename File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New File Name"
            type="text"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRenameDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRename} color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add this new Dialog for bulk delete confirmation */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title">{"Confirm Bulk Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="bulk-delete-dialog-description">
            Are you sure you want to delete the following {selectedFiles.length} item(s)?
            <br />
            <strong style={{ color: 'red' }}>Warning: This action cannot be undone and will permanently delete all selected files and folders.</strong>
            {isFolderSelected && (
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                Attention: One or more folders are selected. Deleting a folder will remove all its contents, including subfolders and files.
              </p>
            )}
          </DialogContentText>
          <List>
            {selectedFiles.map((filename, index) => {
              const file = uploadedFiles.find(f => f.name === filename);
              const isFolder = file && file.type === 'folder';
              return (
                <ListItem key={index} style={isFolder ? { backgroundColor: '#ffebee' } : {}}>
                  <ListItemIcon>
                    {isFolder ? <FolderIcon style={{ color: '#f44336' }} /> : <InsertDriveFileIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={filename} 
                    primaryTypographyProps={isFolder ? { style: { fontWeight: 'bold', color: '#f44336' } } : {}}
                  />
                  {isFolder && (
                    <Typography variant="caption" style={{ color: '#f44336' }}>
                      (Folder and all contents)
                    </Typography>
                  )}
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBulkDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBulkDelete} color="secondary" autoFocus>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h6" style={{ color: '#ffffff' }}>
            Best Practices for Document Preparation
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography variant="body1" paragraph>
            To optimize the extraction of sentences, paragraphs, or meaningful blocks of text from unstructured documents, consider the following best practices:
          </Typography>
          <List>
            {bestPractices.map((practice, index) => (
              <React.Fragment key={index}>
                <ListItem className={classes.listItem}>
                  <ListItemIcon className={classes.listItemIcon}>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={practice} className={classes.listItemText} />
                </ListItem>
                {index < bestPractices.length - 1 && <Divider component="li" className={classes.divider} />}
              </React.Fragment>
            ))}
          </List>
          <Divider className={classes.divider} />
          <Typography variant="body1" paragraph>
            By following these practices, you can significantly improve the quality and accuracy of text extraction from your documents.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UploadComponent;