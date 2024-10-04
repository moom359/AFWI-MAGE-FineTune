import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, IconButton, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FolderIcon from '@material-ui/icons/Folder';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    maxHeight: 'calc(10 * 53px + 56px)', // 10 rows (53px each) + header row (56px)
    overflow: 'auto',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
  },
}));

function FileList({ files, onDelete, selectedFiles, setSelectedFiles, onFolderClick, onRenameFolder, onDeleteFolder, onRenameFile, onMoveFile, currentFolder, onNavigateUp }) {
  const classes = useStyles();
  const [editingItem, setEditingItem] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [sortedFiles, setSortedFiles] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'descending' });

  useEffect(() => {
    let sortableFiles = [...files];
    if (sortConfig.key) {
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
    setSortedFiles(sortableFiles);
  }, [files, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedFiles(files.map(file => file.name));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelect = (name) => {
    const selectedIndex = selectedFiles.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedFiles, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedFiles.slice(1));
    } else if (selectedIndex === selectedFiles.length - 1) {
      newSelected = newSelected.concat(selectedFiles.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedFiles.slice(0, selectedIndex),
        selectedFiles.slice(selectedIndex + 1),
      );
    }

    setSelectedFiles(newSelected);
  };

  const isSelected = (name) => selectedFiles.indexOf(name) !== -1;

  const handleStartRename = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
  };

  const handleFinishRename = () => {
    if (editingItem && newItemName) {
      if (editingItem.type === 'folder') {
        onRenameFolder(editingItem.name, newItemName);
      } else {
        onRenameFile(editingItem.name, newItemName);
      }
    }
    setEditingItem(null);
    setNewItemName('');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getFileIcon = (fileType) => {
    switch(fileType) {
      case 'folder':
        return <FolderIcon fontSize="small" />;
      case 'pdf':
        return <InsertDriveFileIcon fontSize="small" style={{ color: 'red' }} />;
      case 'docx':
        return <InsertDriveFileIcon fontSize="small" style={{ color: 'blue' }} />;
      case 'txt':
        return <InsertDriveFileIcon fontSize="small" style={{ color: 'gray' }} />;
      default:
        return <InsertDriveFileIcon fontSize="small" />;
    }
  };

  const getSortIcon = (name) => {
    if (sortConfig.key === name) {
      return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
    }
    return null;
  };

  const handleDragStart = (e, file) => {
    console.log('Drag started', file);
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify(file));
  };

  const handleDragOver = (e) => {
    console.log('Drag over');
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, targetFolder) => {
    console.log('Drop', targetFolder);
    e.preventDefault();
    e.stopPropagation();
    try {
      const droppedFile = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log('Dropped file:', droppedFile);
      if (droppedFile.type !== 'folder' && droppedFile.name !== targetFolder.name) {
        onMoveFile(droppedFile, targetFolder);
      }
    } catch (error) {
      console.error('Error parsing dropped file:', error);
    }
  };

  const handleDropToParent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const droppedFile = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log('Dropped file to parent:', droppedFile);
      if (droppedFile && droppedFile.type !== 'folder') {
        onMoveFile(droppedFile, { name: '..', type: 'folder', path: currentFolder.split('/').slice(0, -1).join('/') });
      }
    } catch (error) {
      console.error('Error parsing dropped file for parent:', error);
    }
  };

  return (
    <Paper>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        <Typography variant="subtitle1">
          Current Folder: {currentFolder || "Root"}
        </Typography>
      </div>
      <TableContainer className={classes.tableContainer}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.stickyHeader} padding="checkbox">
                <Checkbox
                  indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                  checked={files.length > 0 && selectedFiles.length === files.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell className={classes.stickyHeader}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => requestSort('name')}>
                  Name {getSortIcon('name')}
                </div>
              </TableCell>
              <TableCell className={classes.stickyHeader}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => requestSort('type')}>
                  Type {getSortIcon('type')}
                </div>
              </TableCell>
              <TableCell className={classes.stickyHeader}>Size</TableCell>
              <TableCell className={classes.stickyHeader}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => requestSort('uploadDate')}>
                  Upload Date {getSortIcon('uploadDate')}
                </div>
              </TableCell>
              <TableCell className={classes.stickyHeader}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentFolder && (
              <TableRow
                onDragOver={handleDragOver}
                onDrop={handleDropToParent}
              >
                <TableCell colSpan={6}>
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={onNavigateUp}>
                    <ArrowUpwardIcon fontSize="small" />
                    <span style={{ marginLeft: '5px' }}>Parent Folder</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {sortedFiles.map((file) => {
              const isItemSelected = isSelected(file.name);
              return (
                <TableRow
                  key={file.name}
                  selected={isItemSelected}
                  onClick={() => file.type === 'folder' ? onFolderClick(file.name) : handleSelect(file.name)}
                  draggable={file.type !== 'folder'}
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => file.type === 'folder' && handleDrop(e, file)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} />
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {getFileIcon(file.type)}
                      <span style={{ marginLeft: '5px' }}>{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{file.type === 'folder' ? 'Folder' : file.type.toUpperCase()}</TableCell>
                  <TableCell>{file.type === 'folder' ? '-' : formatFileSize(file.size)}</TableCell>
                  <TableCell>{file.type === 'folder' ? '-' : formatDate(file.uploadDate)}</TableCell>
                  <TableCell>
                    {editingItem && editingItem.name === file.name ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          size="small"
                          style={{ marginRight: '5px' }}
                        />
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleFinishRename(); }}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingItem(null); }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleStartRename(file); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); file.type === 'folder' ? onDeleteFolder(file.name) : onDelete(file.name); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileList;