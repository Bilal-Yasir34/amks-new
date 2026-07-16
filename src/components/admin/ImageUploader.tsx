import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase, MEDIA_BUCKET } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  aspectClass?: string;
}

export default function ImageUploader({ value, onChange, label = 'Image', className = '', aspectClass = 'w-32 h-40' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file);
    if (error) {
      toast.error('Upload failed.');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
    // Also record in media_assets
    await supabase.from('media_assets').insert({
      url: data.publicUrl,
      file_name: file.name,
      file_path: fileName,
      content_type: file.type,
      file_size: file.size,
    });
    onChange(data.publicUrl);
    setUploading(false);
    toast.success('Image uploaded.');
  };

  return (
    <div className={className}>
      <label className="text-xs text-ink-400 block mb-2">{label}</label>
      <div className="flex items-start gap-3">
        {value && (
          <div className="relative group">
            <img src={value} alt={label} className={`${aspectClass} object-cover bg-ink-50`} />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <label className={`flex items-center justify-center cursor-pointer border border-dashed border-ink-200 hover:border-ink-900 transition-colors ${aspectClass} ${value ? 'hidden' : ''}`}>
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-ink-400" /> : <Upload className="w-5 h-5 text-ink-400" />}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}
