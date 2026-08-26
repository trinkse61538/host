import type { ApartmentPhoto } from '../../domain/models';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { photoAssetUrl, staticPhotoFolder } from '../../infrastructure/staticMedia/photoAssets';

interface StaticPhotoEditorProps {
  apartmentId: string;
  photos: ApartmentPhoto[];
  onChange: (photos: ApartmentPhoto[]) => void;
}

export function StaticPhotoEditor({ apartmentId, photos, onChange }: StaticPhotoEditorProps) {
  const updatePhoto = (index: number, patch: Partial<ApartmentPhoto>) => {
    onChange(photos.map((photo, photoIndex) => photoIndex === index ? { ...photo, ...patch } : photo));
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <Card>
      <div className="card-heading">
        <div>
          <span className="eyebrow">Git-managed media</span>
          <h3>Check-in photos</h3>
          <p>
            Put image files in <code>{staticPhotoFolder(apartmentId)}</code>, commit them to GitHub,
            then store only the relative asset path here.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => onChange([...photos, { path: '', caption: '' }])}
        >
          Add photo path
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="notice">
          No static images configured. Example path: <code>media/checkin/{apartmentId || 'apartment-id'}/01-entrance.jpg</code>
        </div>
      ) : (
        <div className="photo-editor-list">
          {photos.map((photo, index) => {
            const src = photoAssetUrl(photo.path);
            return (
              <div className="photo-editor-row" key={`${photo.path}:${index}`}>
                <div className="photo-editor-preview">
                  {src ? <img src={src} alt={photo.caption || `Photo ${index + 1}`} /> : <span>No preview</span>}
                </div>
                <div className="photo-editor-fields">
                  <label>
                    <span>Repository asset path</span>
                    <input
                      className="input"
                      value={photo.path}
                      onChange={event => updatePhoto(index, { path: event.target.value })}
                      placeholder={`media/checkin/${apartmentId || 'apartment-id'}/01-entrance.jpg`}
                    />
                  </label>
                  <label>
                    <span>Caption</span>
                    <input
                      className="input"
                      value={photo.caption}
                      onChange={event => updatePhoto(index, { caption: event.target.value })}
                      placeholder="Building entrance"
                    />
                  </label>
                  <div>
                    <Button variant="danger" onClick={() => removePhoto(index)}>Remove reference</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
