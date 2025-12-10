const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authenticateUser = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP)'));
  }
});

router.get('/', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const { name, price, old_price, category, in_stock, badges, specifications } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, price, category' 
      });
    }

    let imageUrl = req.body.image || null;

    if (req.file) {
      const filename = `product-${Date.now()}.webp`;
      
      const optimizedImage = await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, optimizedImage, {
          contentType: 'image/webp',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      imageUrl = publicUrl;
    }

    const productData = {
      name,
      price: parseInt(price),
      old_price: old_price ? parseInt(old_price) : null,
      category,
      in_stock: in_stock === 'true' || in_stock === true,
      image: imageUrl,
      badges: badges ? JSON.parse(badges) : [],
      specifications: specifications ? JSON.parse(specifications) : []
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert([{
      admin_id: req.adminUser.id,
      action: 'CREATE',
      entity_type: 'product',
      entity_id: product.id.toString(),
      changes: { created: productData }
    }]);

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, old_price, category, in_stock, badges, specifications } = req.body;

    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let imageUrl = req.body.image || existingProduct.image;

    if (req.file) {
      const filename = `product-${Date.now()}.webp`;
      
      const optimizedImage = await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, optimizedImage, {
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      imageUrl = publicUrl;

      if (existingProduct.image) {
        const oldFilename = existingProduct.image.split('/').pop();
        await supabase.storage
          .from('product-images')
          .remove([oldFilename]);
      }
    }

    const productData = {
      name: name || existingProduct.name,
      price: price ? parseInt(price) : existingProduct.price,
      old_price: old_price ? parseInt(old_price) : existingProduct.old_price,
      category: category || existingProduct.category,
      in_stock: in_stock !== undefined ? (in_stock === 'true' || in_stock === true) : existingProduct.in_stock,
      image: imageUrl,
      badges: badges ? JSON.parse(badges) : existingProduct.badges,
      specifications: specifications ? JSON.parse(specifications) : existingProduct.specifications
    };

    const { data: product, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert([{
      admin_id: req.adminUser.id,
      action: 'UPDATE',
      entity_type: 'product',
      entity_id: id.toString(),
      changes: { before: existingProduct, after: productData }
    }]);

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.image) {
      const filename = product.image.split('/').pop();
      await supabase.storage
        .from('product-images')
        .remove([filename]);
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('audit_log').insert([{
      admin_id: req.adminUser.id,
      action: 'DELETE',
      entity_type: 'product',
      entity_id: id.toString(),
      changes: { deleted: product }
    }]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
