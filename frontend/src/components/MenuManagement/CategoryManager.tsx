import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Chip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { categoryStorage } from '../../utils/localStorage';

interface AddCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const AddCategoryDialog = ({ open, onClose, onUpdate }: AddCategoryDialogProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (open) {
      setCategories(categoryStorage.getCategories());
    }
  }, [open]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      categoryStorage.addCategory(newCategory.trim());
      setCategories(categoryStorage.getCategories());
      setNewCategory('');
      onUpdate();
    }
  };

  const handleRemoveCategory = (category: string) => {
    categoryStorage.removeCategory(category);
    setCategories(categoryStorage.getCategories());
    onUpdate();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Categories</DialogTitle>
      <DialogContent>
        <Box className="mb-4">
          <TextField
            fullWidth
            label="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCategory();
              }
            }}
            className="mb-2"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCategory}
            fullWidth
          >
            Add Category
          </Button>
        </Box>

        <Box>
          <Typography variant="subtitle2" className="mb-2">
            Existing Categories:
          </Typography>
          <Box className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Chip
                key={category}
                label={category}
                onDelete={() => handleRemoveCategory(category)}
                deleteIcon={<FontAwesomeIcon icon={faTimes} />}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;

