import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Chip, Typography, Alert, CircularProgress, DialogContentText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { categoriesAPI, Category } from '../../utils/api';
import { categoryStorage } from '../../utils/localStorage';

interface AddCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const AddCategoryDialog = ({ open, onClose, onUpdate }: AddCategoryDialogProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCategories = await categoriesAPI.getAll();
      setCategories(fetchedCategories);
      
      // Also sync to localStorage for backward compatibility
      const categoryNames = fetchedCategories.map(cat => cat.name);
      categoryStorage.saveCategories(categoryNames);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      // Fallback to localStorage
      const localCategories = categoryStorage.getCategories();
      setCategories(localCategories.map(name => ({ id: name, name, displayOrder: 0 })));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    const trimmedName = newCategory.trim();
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Category with this name already exists');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const newCat = await categoriesAPI.create({ name: trimmedName });
      setCategories([...categories, newCat]);
      setNewCategory('');
      
      // Sync to localStorage
      categoryStorage.addCategory(trimmedName);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCategory = (category: Category) => {
    setCategoryToDelete(category);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setError(null);
      setDeletingId(categoryToDelete.id);
      setConfirmDeleteOpen(false);
      await categoriesAPI.delete(categoryToDelete.id);
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      
      // Sync to localStorage
      categoryStorage.removeCategory(categoryToDelete.name);
      setCategoryToDelete(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Categories</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box className="mb-4">
          <TextField
            fullWidth
            label="New Category"
            value={newCategory}
            onChange={(e) => {
              setNewCategory(e.target.value);
              setError(null);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleAddCategory();
              }
            }}
            className="mb-2"
            disabled={loading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCategory}
            fullWidth
            disabled={loading || !newCategory.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Category'}
          </Button>
        </Box>

        <Box>
          <Typography variant="subtitle2" className="mb-2">
            Existing Categories:
          </Typography>
          {loading && categories.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : categories.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No categories yet. Add your first category above.
            </Typography>
          ) : (
            <Box className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Chip
                  key={category.id}
                  label={category.name}
                  onDelete={deletingId === category.id ? undefined : () => handleRemoveCategory(category)}
                  deleteIcon={deletingId === category.id ? <CircularProgress size={16} /> : <FontAwesomeIcon icon={faTimes} />}
                  disabled={deletingId === category.id}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Close</Button>
      </DialogActions>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog
      open={confirmDeleteOpen}
      onClose={handleCancelDelete}
      aria-labelledby="delete-category-dialog-title"
      aria-describedby="delete-category-dialog-description"
    >
      <DialogTitle id="delete-category-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444' }} />
          Confirm Delete Category
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-category-dialog-description">
          Are you sure you want to delete the category <strong>"{categoryToDelete?.name}"</strong>?
          <br /><br />
          {categoryToDelete && (
            <>
              This action cannot be undone. If any menu items are using this category, 
              the deletion will be prevented to maintain data integrity.
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelDelete} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirmDelete} 
          color="error" 
          variant="contained" 
          autoFocus
          disabled={deletingId === categoryToDelete?.id}
        >
          {deletingId === categoryToDelete?.id ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default AddCategoryDialog;

