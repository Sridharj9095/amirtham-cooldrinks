import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { menuStorage, categoryStorage } from "../../utils/localStorage";
import { menuItemsAPI, categoriesAPI } from "../../utils/api";
import { MenuItem } from "../../types";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

const EditMenuItem = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      if (id) {
        try {
          // Try to fetch from API first
          const foundItem = await menuItemsAPI.getById(id);
          setItem(foundItem);
          setName(foundItem.name);
          setCategory(foundItem.category);
          setDescription(foundItem.description || "");
          setPrice(foundItem.price.toString());
          setImageUrl(foundItem.image);
          setPreview(foundItem.image);
        } catch (error: any) {
          // Fallback to localStorage
          const items = menuStorage.getItems();
          const foundItem = items.find((i) => i.id === id);
          if (foundItem) {
            setItem(foundItem);
            setName(foundItem.name);
            setCategory(foundItem.category);
            setDescription(foundItem.description || "");
            setPrice(foundItem.price.toString());
            setImageUrl(foundItem.image);
            setPreview(foundItem.image);
          }
        }
      }
      // Load categories from MongoDB
      try {
        const fetchedCategories = await categoriesAPI.getAll();
        const categoryNames = fetchedCategories.map((cat) => cat.name);
        setCategories(categoryNames);
        // Sync to localStorage for backward compatibility
        categoryStorage.saveCategories(categoryNames);
      } catch (error) {
        // Fallback to localStorage
        setCategories(categoryStorage.getCategories());
      }
    };

    loadItem();
  }, [id]);

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setPreview(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !category || !price || !preview) {
      alert("Please fill all required fields");
      return;
    }

    if (!id) return;

    const image = preview;
    const updateData = {
      name: name.trim(),
      category: category.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      image,
    };

    try {
      // Update in MongoDB via API
      await menuItemsAPI.update(id, updateData);

      // Also update in localStorage as backup
      menuStorage.updateItem(id, updateData);

      // Show success message
      setSnackbarOpen(true);

      // Navigate after a short delay to show the message
      setTimeout(() => {
        navigate("/manage-menu");
      }, 1500);
    } catch (error: any) {
      alert(`Failed to update menu item: ${error.message}`);
      // Still try to update in localStorage as fallback
      try {
        menuStorage.updateItem(id, updateData);
      } catch (localError) {
        // Error updating in localStorage
      }
    }
  };

  if (!item) {
    return (
      <Container maxWidth="md" className="py-8">
        <Typography>Item not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Button
        startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
        onClick={() => navigate("/manage-menu")}
        className="mb-4"
      >
        Back
      </Button>

      <Paper className="p-6">
        <Typography variant="h5" className="font-bold mb-6">
          Edit Menu Item
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
              {categories.map((cat) => (
                <MuiMenuItem key={cat} value={cat}>
                  {cat}
                </MuiMenuItem>
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
            Update Menu Item
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
          icon={<FontAwesomeIcon icon={faSave} />}
        >
          Changes saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditMenuItem;
