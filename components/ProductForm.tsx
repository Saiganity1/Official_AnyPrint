"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    images?: { url: string }[];
    category?: string;
    variants?: any[];
  };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [mainFiles, setMainFiles] = useState<File[]>([]);
  // Start with existing images (main imageUrl first, then the gallery images)
  const existingImages = initialData 
    ? [initialData.imageUrl, ...(initialData.images?.map(i => i.url) || [])].filter(Boolean) as string[]
    : [];
  const [imagePreviews, setImagePreviews] = useState<string[]>(existingImages);
  
  // Track variant files by index
  const [variantFiles, setVariantFiles] = useState<Record<number, File>>({});

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    category: initialData?.category || "Uncategorized",
  });

  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);

  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", stock: 0, price: "", sku: "", imageUrl: null }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    const newVariantFiles = { ...variantFiles };
    delete newVariantFiles[index];
    setVariantFiles(newVariantFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setMainFiles([...mainFiles, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeMainImage = (index: number) => {
    const isExistingImage = index < existingImages.length;
    if (isExistingImage) {
      existingImages.splice(index, 1);
    } else {
      const fileIndex = index - existingImages.length;
      const newFiles = [...mainFiles];
      newFiles.splice(fileIndex, 1);
      setMainFiles(newFiles);
    }
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleVariantImageSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVariantFiles({ ...variantFiles, [index]: file });
      updateVariant(index, 'imageUrl', URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress nicely
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Process main images to Base64
      const uploadedMainUrls = await Promise.all(mainFiles.map(fileToBase64));
      
      // The final images array will be the existing images left + the newly uploaded ones
      const finalImages = [...existingImages, ...uploadedMainUrls];
      const mainImageUrl = finalImages.length > 0 ? finalImages[0] : null;
      const additionalImages = finalImages.length > 1 ? finalImages.slice(1) : [];

      // 2. Process variant images to Base64
      const finalVariants = [...variants];
      for (let i = 0; i < finalVariants.length; i++) {
        if (variantFiles[i]) {
          finalVariants[i].imageUrl = await fileToBase64(variantFiles[i]);
        }
      }

      // 3. Save product data
      const url = initialData ? `/api/admin/products/${initialData.id}` : `/api/admin/products`;
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          imageUrl: mainImageUrl,
          images: additionalImages,
          variants: finalVariants 
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Something went wrong");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
      {error && <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontWeight: '500' }}>Product Gallery Images</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {imagePreviews.map((preview, idx) => (
            <div key={idx} style={{ width: '80px', height: '80px', position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => removeMainImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                &times;
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={handleMainImagesSelect} className="input-field" style={{ padding: '0.5rem' }} />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 2 }}>
          <label htmlFor="name" style={{ fontWeight: '500' }}>Product Name</label>
          <input required id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. YALEX PLAIN SHIRT Red" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <label htmlFor="category" style={{ fontWeight: '500' }}>Category</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} className="input-field" style={{ padding: '0.5rem' }}>
            {CATEGORIES.filter(c => c !== "All").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="description" style={{ fontWeight: '500' }}>Description</label>
        <textarea required id="description" name="description" value={formData.description} onChange={handleChange} className="input-field" rows={4} placeholder="Product description..." />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <label htmlFor="price" style={{ fontWeight: '500' }}>Price (₱)</label>
          <input required type="number" step="0.01" min="0" id="price" name="price" value={formData.price} onChange={handleChange} className="input-field" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <label htmlFor="stock" style={{ fontWeight: '500' }}>Stock Level</label>
          <input required type="number" min="0" id="stock" name="stock" value={formData.stock} onChange={handleChange} className="input-field" disabled={variants.length > 0} />
        </div>
      </div>

      <div style={{ padding: '1.5rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Product Variants</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Optional: Add sizes and colors</p>
          </div>
          <button type="button" onClick={addVariant} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
            + Add Variant
          </button>
        </div>
        
        {variants.length > 0 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '1rem', background: 'rgba(0,174,239,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <strong>Pro Tip:</strong> Click "+ Add Variant" to create a new row for each unique size (e.g. Size M, Size L). This lets you set a different price for every single size! Note: The main stock level will be automatically calculated from your variant stock.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {variants.map((variant, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', position: 'relative', paddingRight: '2.5rem' }}>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Color</label>
                  <input placeholder="e.g. Red" value={variant.color || ''} onChange={e => updateVariant(index, 'color', e.target.value)} className="input-field" style={{ padding: '0.5rem', width: '100%' }} />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Specific Size</label>
                  <input placeholder="e.g. Size M" value={variant.size || ''} onChange={e => updateVariant(index, 'size', e.target.value)} className="input-field" style={{ padding: '0.5rem', width: '100%' }} />
                </div>
                <div style={{ flex: '1 1 80px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Stock</label>
                  <input type="number" placeholder="0" min="0" value={variant.stock} onChange={e => updateVariant(index, 'stock', Number(e.target.value))} className="input-field" style={{ padding: '0.5rem', width: '100%' }} required />
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Price (₱)</label>
                  <input type="number" placeholder="0.00" min="0" value={variant.price || ''} onChange={e => updateVariant(index, 'price', e.target.value)} className="input-field" style={{ padding: '0.5rem', width: '100%' }} />
                </div>
                <button type="button" onClick={() => removeVariant(index)} style={{ position: 'absolute', right: '0.5rem', top: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.25rem', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove">
                  &times;
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Variant Image:</span>
                {variant.imageUrl && (
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={variant.imageUrl} alt="Variant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleVariantImageSelect(index, e)} className="input-field" style={{ padding: '0.25rem', fontSize: '0.75rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} disabled={isLoading} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
