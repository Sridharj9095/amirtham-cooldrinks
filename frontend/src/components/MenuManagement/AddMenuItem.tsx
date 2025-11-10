import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuStorage, categoryStorage } from '../../utils/localStorage';
import { menuItemsAPI } from '../../utils/api';
import { Container, Box, Typography, TextField, Button, Paper, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

const AddMenuItem = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    setCategories(categoryStorage.getCategories());
  }, []);

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setPreview(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !price || (!imageUrl && !preview)) {
      alert('Please fill all required fields');
      return;
    }

    const image = preview || imageUrl;
    const newItem = {
      name: name.trim(),
      category: category.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      image,
    };

    try {
      // Save to MongoDB via API
      const savedItem = await menuItemsAPI.create(newItem);
      
      // Also save to localStorage as backup
      menuStorage.addItem(savedItem);
      
      // Show success message
      setSnackbarOpen(true);
      
      // Navigate after a short delay to show the message
      setTimeout(() => {
        navigate('/manage-menu');
      }, 1500);
    } catch (error: any) {
      alert(`Failed to save menu item: ${error.message}`);
      // Still try to save to localStorage as fallback
      try {
        menuStorage.addItem({
          ...newItem,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      } catch (localError) {
        // Error saving to localStorage
      }
    }
  };

  return (
    <Container maxWidth="md" className="py-8">
      <Button
        startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
        onClick={() => navigate('/manage-menu')}
        className="mb-4"
      >
        Back
      </Button>

      <Paper className="p-6">
        <Typography variant="h5" className="font-bold mb-6">
          Add Menu Item
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mb-4"
          />

          <FormControl fullWidth className="mb-4" required>
            <InputLabel id="category-select-label" shrink={!!category}>
              Category
            </InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
              required
              notched={!!category}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            className="mb-4"
          />

          <TextField
            fullWidth
            label="Price (₹)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mb-4"
          />

          <Box className="mb-4">
            <Typography variant="subtitle2" className="mb-2">
              Image (URL or Upload)
            </Typography>
            <TextField
              fullWidth
              label="Image URL"
              value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="mb-2"
              disabled={!!imageFile}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={!!imageUrl}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>

          {preview && (
            <Box className="mb-4">
              <Typography variant="subtitle2" className="mb-2">
                Preview:
              </Typography>
              <img
                src={preview}
                alt="Preview"
                loading="lazy"
                className="max-w-full h-48 object-cover rounded-lg border"
              />
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faSave} />}
            fullWidth
            size="large"
          >
            Save Menu Item
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
          icon={<FontAwesomeIcon icon={faSave} />}
        >
          Menu item saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddMenuItem;

