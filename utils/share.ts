import { PlantDetails } from '../types';

export async function sharePlant(plant: PlantDetails) {
  const text = `I found a ${plant.commonName} (${plant.scientificName})! 🌿\n\n${plant.description}\n\nIdentified with Leafy AI.`;

  if (navigator.share) {
    const shareData: any = { title: `Leafy: ${plant.commonName}`, text };

    if (plant.imageUrl) {
      try {
        const response = await fetch(plant.imageUrl);
        const blob = await response.blob();
        const extension = blob.type.split('/')[1] || 'jpg';
        const file = new File([blob], `plant.${extension}`, { type: blob.type });
        const fileShareData = { ...shareData, files: [file] };

        if (navigator.canShare && navigator.canShare(fileShareData)) {
          await navigator.share(fileShareData);
          return { shared: true };
        }
      } catch (err) {
        // fallback to text share
      }
    }

    await navigator.share(shareData);
    return { shared: true };
  }

  await navigator.clipboard.writeText(text);
  return { shared: false, copied: true };
}

export default sharePlant;
