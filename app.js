const video = document.getElementById('camera');
const captureButton = document.getElementById('capture');
const uploadButton = document.getElementById('upload');
const photoGallery = document.getElementById('photoGallery');
const playerNameInput = document.getElementById('playerName');
const thankYouMessage = document.getElementById('thank-you-message');
const maxPhotos = 20;
let photoBlobs = []; // Store photo blobs

// Request camera access and stream to the video element
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error('Error accessing the camera:', err);
      alert('Camera permissions are required to use this feature. Please enable them in your browser settings.');
    });
} else {
  alert('Your browser does not support camera functionality.');
}

// Capture button functionality
captureButton.addEventListener('click', () => {
  if (photoGallery.children.length >= maxPhotos) {
    alert('You can only take up to 20 photos.');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the photo to a Blob and store it
  canvas.toBlob((blob) => {
    photoBlobs.push(blob); // Add to photoBlobs array

    // Display the captured photo in the gallery
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.objectFit = 'cover';
    photoGallery.appendChild(img);
  });
});

// Upload all photos functionality
uploadButton.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();

  if (!playerName) {
    alert('Please enter your name before uploading photos.');
    return;
  }

  if (photoBlobs.length === 0) {
    alert('No photos to upload!');
    return;
  }

  // Upload each photo
  const uploadPromises = photoBlobs.map((blob, index) => {
    const formData = new FormData();
    formData.append('photo', blob, `photo-${Date.now()}-${index}.png`);
    formData.append('playerName', playerName); // Include the player's name in the request

    return fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Photo ${index + 1} upload failed`);
        }
        return response.json();
      });
  });

  Promise.all(uploadPromises)
    .then(() => {
      alert('All photos uploaded successfully!');
      thankYouMessage.style.display = 'block';

      // Clear gallery and blobs after upload
      photoBlobs = [];
      photoGallery.innerHTML = '';

      // Hide thank-you message after 5 seconds
      setTimeout(() => {
        thankYouMessage.style.display = 'none';
      }, 5000);
    })
    .catch((error) => {
      console.error('Error uploading photos:', error);
      alert('An error occurred while uploading your photos. Please try again.');
    });
});
