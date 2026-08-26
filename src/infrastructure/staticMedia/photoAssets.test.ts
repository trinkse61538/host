import { describe, expect, it } from 'vitest';
import { legacyStoragePathToStaticPath, normalizePhotoPath, normalizeStoredPhoto } from './photoAssets';

describe('static photo assets', () => {
  it('maps legacy Firebase Storage paths into the Git-managed check-in folder', () => {
    expect(legacyStoragePathToStaticPath('apartment-media/unit-1/photo.jpg'))
      .toBe('media/checkin/apartment-media/unit-1/photo.jpg');
  });

  it('prefers the new static path when both formats exist', () => {
    expect(normalizeStoredPhoto({
      path: 'media/checkin/unit-1/entrance.jpg',
      storagePath: 'apartment-media/unit-1/old.jpg',
      caption: 'Entrance',
    })).toEqual({ path: 'media/checkin/unit-1/entrance.jpg', caption: 'Entrance' });
  });

  it('removes a leading slash from repository asset paths', () => {
    expect(normalizePhotoPath('/media/checkin/unit-1/door.jpg')).toBe('media/checkin/unit-1/door.jpg');
  });
});
