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
  
  // Track variant files by group index
  const [variantFiles, setVariantFiles] = useState<Record<number, File>>({});

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    category: initialData?.category || "Uncategorized",
  });

  // Group flat variants into hierarchical groups on load
  const [variantGroups, setVariantGroups] = useState<any[]>(() => {
    const flatVariants = initialData?.variants || [];
    const groupsMap = new Map<string, any>();
    
    flatVariants.forEach((v: any) => {
      const groupKey = v.color || "Default";
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          color: v.color || "",
          imageUrl: v.imageUrl || null,
          sizes: []
        });
      }
      groupsMap.get(groupKey).sizes.push({
        size: v.size || "",
        stock: v.stock || 0,
        price: v.price || ""
      });
    });

    return Array.from(groupsMap.values());
  });

  const [expandedVariants, setExpandedVariants] = useState<number[]>([]);
  const [showGlobalSize, setShowGlobalSize] = useState(false);
  const [globalSizeForm, setGlobalSizeForm] = useState({ size: "" });

  const [availableSizes, setAvailableSizes] = useState<string[]>(() => {
    const sizes = new Set<string>();
    const flatVariants = initialData?.variants || [];
    flatVariants.forEach((v: any) => {
      if (v.size) sizes.add(v.size);
    });
    return Array.from(sizes);
  });

  const applyGlobalSize = () => {
    if (variantGroups.length === 0) {
      setError("Please add at least one Variant Group first.");
      return;
    }
    const sizeName = globalSizeForm.size.trim();
    if (!sizeName) {
      setError("Please enter a specific size (e.g. XXL).");
      return;
    }

    if (!availableSizes.includes(sizeName)) {
      setAvailableSizes([...availableSizes, sizeName]);
    }

    const newGroups = variantGroups.map(group => ({
      ...group,
      sizes: [...group.sizes, { size: sizeName, stock: 0, price: "" }]
    }));
    
    setVariantGroups(newGroups);
    setShowGlobalSize(false);
    setGlobalSizeForm({ size: "" });
    setError("");
  };

  const addVariantGroup = () => {
    const newIndex = variantGroups.length;
    setVariantGroups([...variantGroups, { color: "", imageUrl: null, sizes: [] }]);
    setExpandedVariants([...expandedVariants, newIndex]);
  };

  const toggleVariantGroup = (index: number) => {
    if (expandedVariants.includes(index)) {
      setExpandedVariants(expandedVariants.filter(i => i !== index));
    } else {
      setExpandedVariants([...expandedVariants, index]);
    }
  };

  const updateVariantGroup = (index: number, field: string, value: any) => {
    const newGroups = [...variantGroups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setVariantGroups(newGroups);
  };

  const removeVariantGroup = (index: number) => {
    setVariantGroups(variantGroups.filter((_, i) => i !== index));
    const newVariantFiles = { ...variantFiles };
    delete newVariantFiles[index];
    setVariantFiles(newVariantFiles);
  };

  const addSizeToGroup = (groupIndex: number) => {
    const newGroups = [...variantGroups];
    newGroups[groupIndex].sizes.push({ size: "", stock: 0, price: "" });
    setVariantGroups(newGroups);
  };

  const updateVariantSize = (groupIndex: number, sizeIndex: number, field: string, value: any) => {
    const newGroups = [...variantGroups];
    newGroups[groupIndex].sizes[sizeIndex] = { ...newGroups[groupIndex].sizes[sizeIndex], [field]: value };
    setVariantGroups(newGroups);
  };

  const removeVariantSize = (groupIndex: number, sizeIndex: number) => {
    const newGroups = [...variantGroups];
    newGroups[groupIndex].sizes.splice(sizeIndex, 1);
    setVariantGroups(newGroups);
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
      updateVariantGroup(index, 'imageUrl', URL.createObjectURL(file));
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

  const showError = (msg: string) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return showError("Product Name is required.");
    if (!formData.description.trim()) return showError("Description is required.");
    if (String(formData.price) === "" || Number(formData.price) < 0) return showError("Valid Base Price is required.");
    if (variantGroups.length === 0 && (String(formData.stock) === "" || Number(formData.stock) < 0)) return showError("Valid Base Stock is required.");

    for (let i = 0; i < variantGroups.length; i++) {
      for (let j = 0; j < variantGroups[i].sizes.length; j++) {
        const s = variantGroups[i].sizes[j];
        if (s.stock === "" || Number(s.stock) < 0) {
          return showError(`Stock is required for all variant sizes (Group ${i + 1}, Size ${j + 1}).`);
        }
      }
    }

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
      const finalVariantGroups = [...variantGroups];
      for (let i = 0; i < finalVariantGroups.length; i++) {
        if (variantFiles[i]) {
          finalVariantGroups[i].imageUrl = await fileToBase64(variantFiles[i]);
        }
      }

      // Flatten hierarchical groups into flat variant array for the API
      const flattenedVariants: any[] = [];
      finalVariantGroups.forEach(group => {
        if (group.sizes.length === 0) {
          flattenedVariants.push({
            color: group.color,
            imageUrl: group.imageUrl,
            size: "",
            stock: 0,
            price: null
          });
        } else {
          group.sizes.forEach((s: any) => {
            flattenedVariants.push({
              color: group.color,
              imageUrl: group.imageUrl,
              size: s.size,
              stock: s.stock || 0,
              price: s.price ? Number(s.price) : null
            });
          });
        }
      });

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
          variants: flattenedVariants 
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Something went wrong");
      }

      alert(initialData ? "Product successfully updated!" : "Product successfully created!");

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      showError(err.message);
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
          <input id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. YALEX PLAIN SHIRT Red" />
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
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="input-field" rows={4} placeholder="Product description..." />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <label htmlFor="price" style={{ fontWeight: '500' }}>Base Price (₱)</label>
          <input type="number" step="0.01" min="0" id="price" name="price" value={formData.price} onChange={handleChange} className="input-field" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <label htmlFor="stock" style={{ fontWeight: '500' }}>Base Stock</label>
          <input type="number" min="0" id="stock" name="stock" value={formData.stock} onChange={handleChange} className="input-field" disabled={variantGroups.length > 0} />
        </div>
      </div>

      <div style={{ padding: '1.5rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Product Variants</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Optional: Add grouped variants (e.g. Color → Sizes)</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {variantGroups.length > 0 && (
              <button type="button" onClick={() => setShowGlobalSize(!showGlobalSize)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                + Add Size (All Groups)
              </button>
            )}
            <button type="button" onClick={addVariantGroup} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
              + Add Variant Group
            </button>
          </div>
        </div>
        
        {showGlobalSize && (
          <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>Define Global Size</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
              This will add a new Size option to your dropdowns AND instantly add it to all existing Color groups.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Size Name</label>
                <input placeholder="e.g. XXL, Size 10" value={globalSizeForm.size} onChange={e => setGlobalSizeForm({ size: e.target.value })} className="input-field" style={{ padding: '0.5rem', width: '100%' }} />
              </div>
              <button type="button" onClick={applyGlobalSize} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Add to All Groups
              </button>
              <button type="button" onClick={() => setShowGlobalSize(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {variantGroups.length > 0 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '1rem', background: 'rgba(0,174,239,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <strong>Pro Tip:</strong> Create a group for a specific Color/Style, upload its image, and then click "+ Add Size" inside that group to quickly add multiple sizes!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {variantGroups.map((group, groupIndex) => {
            const totalStock = group.sizes.reduce((sum: number, size: any) => sum + Number(size.stock || 0), 0);
            
            return (
              <div key={groupIndex} style={{ background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleVariantGroup(groupIndex)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background-secondary)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <svg 
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                      style={{ transform: expandedVariants.includes(groupIndex) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--foreground-muted)' }}
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span style={{ fontWeight: '600' }}>
                      {group.color ? group.color : `New Group ${groupIndex + 1}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                      Total Stock: {totalStock} | {group.sizes.length} Sizes
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeVariantGroup(groupIndex); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', lineHeight: 1 }} title="Remove Group">
                      &times;
                    </button>
                  </div>
                </div>

                {/* Collapsible Content */}
                {expandedVariants.includes(groupIndex) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    
                    {/* Group Level Info (Color & Image) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'var(--background-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Variant Group Name / Color</label>
                        <input placeholder="e.g. Red, Blue, Default" value={group.color} onChange={e => updateVariantGroup(groupIndex, 'color', e.target.value)} className="input-field" style={{ padding: '0.5rem', width: '100%' }} />
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--background)' }}>
                          {group.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={group.imageUrl} alt="Group" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--foreground-muted)', textAlign: 'center' }}>No Img</div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Group Image (Optional)</label>
                          <input type="file" accept="image/*" onChange={(e) => handleVariantImageSelect(groupIndex, e)} className="input-field" style={{ padding: '0.25rem', fontSize: '0.75rem', width: '100%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Sizes Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Sizes & Pricing</h4>
                      <button type="button" onClick={() => addSizeToGroup(groupIndex)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        + Add Size
                      </button>
                    </div>

                    {/* Sizes List */}
                    {group.sizes.map((size: any, sizeIndex: number) => (
                      <div key={sizeIndex} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', position: 'relative', paddingRight: '2.5rem', alignItems: 'flex-end', borderBottom: sizeIndex !== group.sizes.length - 1 ? '1px dashed var(--border)' : 'none', paddingBottom: sizeIndex !== group.sizes.length - 1 ? '0.75rem' : '0' }}>
                        <div style={{ flex: '1 1 120px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Specific Size</label>
                          <select 
                            value={size.size} 
                            onChange={e => updateVariantSize(groupIndex, sizeIndex, 'size', e.target.value)} 
                            className="input-field" 
                            style={{ padding: '0.5rem', width: '100%' }}
                          >
                            <option value="">Select Size...</option>
                            {availableSizes.map(sz => (
                              <option key={sz} value={sz}>{sz}</option>
                            ))}
                            {/* In case they had a size from DB that isn't in availableSizes somehow */}
                            {size.size && !availableSizes.includes(size.size) && (
                              <option value={size.size}>{size.size}</option>
                            )}
                          </select>
                        </div>
                        <div style={{ flex: '1 1 80px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Stock</label>
                          <input type="number" placeholder="0" min="0" value={size.stock} onChange={e => updateVariantSize(groupIndex, sizeIndex, 'stock', Number(e.target.value))} className="input-field" style={{ padding: '0.5rem', width: '100%' }} />
                        </div>
                        <div style={{ flex: '1 1 140px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Price for this Size (₱)</label>
                          <input type="number" placeholder="0.00" min="0" value={size.price} onChange={e => updateVariantSize(groupIndex, sizeIndex, 'price', e.target.value)} className="input-field" style={{ padding: '0.5rem', width: '100%' }} />
                        </div>
                        <button type="button" onClick={() => removeVariantSize(groupIndex, sizeIndex)} style={{ position: 'absolute', right: '0.5rem', bottom: sizeIndex !== group.sizes.length - 1 ? '1.25rem' : '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.25rem', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }} title="Remove Size">
                          &times;
                        </button>
                      </div>
                    ))}
                    
                    {group.sizes.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--foreground-muted)', fontSize: '0.875rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        No sizes added. Click "+ Add Size" to set prices and stock for this color.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

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
