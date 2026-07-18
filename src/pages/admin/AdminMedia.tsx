import { useEffect, useState, useCallback } from 'react';
import { Upload, Search, Trash2, X, Copy, Loader2 } from 'lucide-react';
import { supabase, MEDIA_BUCKET } from '../../lib/supabase';
import type { MediaAsset } from '../../types';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Pagination from '../../components/admin/Pagination';

export default function AdminMedia() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const pageSize = 24;

  const loadAssets = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false });
    setAssets((data || []) as MediaAsset[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    let success = 0;
    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file);
      if (error) continue;
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
      await supabase.from('media_assets').insert({ url: data.publicUrl, file_name: file.name, file_path: fileName, content_type: file.type, file_size: file.size });
      success++;
    }
    if (success > 0) toast.success(`${success} image${success > 1 ? 's' : ''} uploaded.`);
    else toast.error('Upload failed.');
    setUploading(false);
    loadAssets();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const asset = assets.find((a) => a.id === deleteId);
    if (asset) {
      // Delete from storage
      await supabase.storage.from(MEDIA_BUCKET).remove([asset.file_path]);
      // Delete from DB
      await supabase.from('media_assets').delete().eq('id', deleteId);
    }
    toast.success('Image deleted.');
    setDeleteId(null);
    loadAssets();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied.');
  };

  const filtered = assets.filter((a) => a.file_name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-light">Media Library</h1>
        <label className="btn-primary !py-2.5 !px-5 text-xs cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} disabled={uploading} />
        </label>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
        <input type="text" placeholder="Search images..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none bg-white" />
      </div>

      {loading ? (
        <p className="text-sm text-ink-400 text-center py-12">Loading...</p>
      ) : paginated.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-12">No images found. Upload some!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {paginated.map((asset) => (
            <div key={asset.id} className="group relative aspect-square border border-ink-100 overflow-hidden bg-ink-50">
              <img src={asset.url} alt={asset.file_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button onClick={() => setPreview(asset)} className="p-2 bg-white text-ink-900 hover:bg-ink-100" aria-label="Preview"><Search className="w-4 h-4" /></button>
                  <button onClick={() => copyUrl(asset.url)} className="p-2 bg-white text-ink-900 hover:bg-ink-100" aria-label="Copy URL"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(asset.id)} className="p-2 bg-white text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="absolute bottom-0 left-0 right-0 bg-white/90 px-2 py-1 text-[10px] truncate">{asset.file_name}</p>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-ink-900/80 z-[100] flex items-center justify-center p-8" onClick={() => setPreview(null)}>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={preview.url} alt={preview.file_name} className="w-full max-h-[70vh] object-contain mb-4" />
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium">{preview.file_name}</p>
                <p className="text-xs text-ink-400">{preview.content_type} · {preview.file_size ? `${(preview.file_size / 1024).toFixed(0)} KB` : ''}</p>
              </div>
              <button onClick={() => setPreview(null)} className="p-2 hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Image" message="This will permanently delete the image from storage." confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
