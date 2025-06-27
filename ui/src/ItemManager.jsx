import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";

const API_URL = "https://l432xcsxj1.execute-api.eu-west-1.amazonaws.com/dev/items";

const ItemManager = () => {
  const [items, setItems] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: "", name: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenForm = (item = { id: "", name: "" }) => {
    setCurrentItem(item);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentItem({ id: "", name: "" });
  };

  const handleSave = async () => {
    const method = currentItemExists() ? "PUT" : "POST";
    try {
      await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem),
      });
      handleCloseForm();
      fetchItems();
      setSnackbar({ open: true, message: "Item saved successfully!" });
    } catch (error) {
      console.error(error);
    }
  };

  const currentItemExists = () => {
    return items.some((item) => item.id === currentItem.id);
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    try {
      await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      handleCloseDelete();
      fetchItems();
      setSnackbar({ open: true, message: "Item deleted successfully!" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Item Manager
      </Typography>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>
          Add Item
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>ID</strong></TableCell>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpenForm(item)}>
                  <Edit color="primary" />
                </IconButton>
                <IconButton onClick={() => handleOpenDelete(item.id)}>
                  <Delete color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{currentItemExists() ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="ID"
              value={currentItem.id}
              onChange={(e) => setCurrentItem({ ...currentItem, id: e.target.value })}
              disabled={currentItemExists()}
              fullWidth
            />
            <TextField
              label="Name"
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete item with ID: <strong>{deleteId}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ItemManager;
