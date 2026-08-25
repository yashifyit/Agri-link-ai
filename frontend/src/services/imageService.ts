import { CROPS_CATALOG, CropItem, CropImageMetadata } from '../data/crops';

// High quality generic agricultural produce harvest fallback
export const DEFAULT_CROP_FALLBACK = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800';

export function getCropImageMetadata(cropName: string): CropImageMetadata | null {
  if (!cropName) return null;
  const normalized = cropName.toLowerCase().trim();

  const found = CROPS_CATALOG.find(
    c => c.name.toLowerCase() === normalized ||
         c.cropId.toLowerCase() === normalized ||
         c.id.toLowerCase() === normalized ||
         c.hindiName === cropName ||
         c.marathiName === cropName ||
         c.localNames.toLowerCase().includes(normalized) ||
         normalized.includes(c.name.toLowerCase()) ||
         c.name.toLowerCase().includes(normalized)
  );

  return found || null;
}

export function getCropImage(cropName: string): string {
  const metadata = getCropImageMetadata(cropName);
  if (metadata && metadata.imageUrl) {
    return metadata.imageUrl;
  }
  return DEFAULT_CROP_FALLBACK;
}

export function getCropSecondaryImage(cropName: string): string {
  const metadata = getCropImageMetadata(cropName);
  if (metadata && metadata.secondaryImageUrl) {
    return metadata.secondaryImageUrl;
  }
  return DEFAULT_CROP_FALLBACK;
}

export function getFarmerAvatar(index: number = 0): string {
  const avatars = [
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300'
  ];
  return avatars[index % avatars.length];
}
