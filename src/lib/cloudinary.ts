export async function uploadToCloudinary(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
    if (!cloudName || !uploadPreset) {
        console.warn("Cloudinary config missing, using mock upload");
        // Return a mock URL for development
        return "https://example.com/mock-video-url.mp4";
    }
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url; // This is the video URL
}