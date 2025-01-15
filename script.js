// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Mobile menu toggle
    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuButton) {
        menuButton.addEventListener("click", function() {
            mobileMenu.classList.toggle("open");
        });
    }

    // Media handling for photo and video capture
    const videoElement = document.getElementById("camera");
    const captureButton = document.getElementById("capture");
    const recordButton = document.getElementById("record");
    const stopButton = document.getElementById("stop-recording");
    const photoGallery = document.getElementById("photoGallery");
    const switchCameraButton = document.getElementById("switch-camera");
    const uploadButton = document.getElementById("upload");

    let mediaStream = null;
    let mediaRecorder = null;
    let isRecording = false;
    let photoCount = 0;
    let videoCount = 0;
    const maxPhotos = 20;
    const maxVideos = 3;
    const maxVideoDuration = 3 * 60 * 1000;

    // Request access to the user's camera
    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: true
            });
            videoElement.srcObject = mediaStream;
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Unable to access your camera.");
        }
    }

    // Capture photo
    captureButton.addEventListener("click", () => {
        if (photoCount >= maxPhotos) {
            alert(`You can only take up to ${maxPhotos} photos.`);
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL("image/png");
        const img = document.createElement("img");
        img.src = imageUrl;
        photoGallery.appendChild(img);

        photoCount++;
        alert(`You have ${maxPhotos - photoCount} photos remaining.`);
    });

    // Start/stop video recording
    recordButton.addEventListener("click", () => {
        if (videoCount >= maxVideos) {
            alert(`You can only record up to ${maxVideos} videos.`);
            return;
        }

        if (isRecording) {
            mediaRecorder.stop();
            stopButton.style.display = "none";
            recordButton.style.display = "block";
            isRecording = false;
        } else {
            mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorder.start();
            stopButton.style.display = "block";
            recordButton.style.display = "none";
            isRecording = true;

            videoCount++;
            alert(`Recording started. You have ${maxVideos - videoCount} videos remaining.`);

            // Stop the recording after maxVideoDuration
            setTimeout(() => {
                if (isRecording) {
                    mediaRecorder.stop();
                    stopButton.style.display = "none";
                    recordButton.style.display = "block";
                    isRecording = false;
                    alert("Recording stopped automatically after 3 minutes.");
                }
            }, maxVideoDuration);

            mediaRecorder.ondataavailable = (event) => {
                const videoBlob = event.data;
                const videoUrl = URL.createObjectURL(videoBlob);
                const videoElement = document.createElement("video");
                videoElement.src = videoUrl;
                videoElement.controls = true;
                photoGallery.appendChild(videoElement);
            };
        }
    });

    // Switch camera
    switchCameraButton.addEventListener("click", async () => {
        if (mediaStream) {
            const videoTracks = mediaStream.getVideoTracks();
            videoTracks.forEach(track => track.stop());
        }

        const newFacingMode = videoElement.facingMode === "user" ? "environment" : "user";
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newFacingMode },
            audio: true
        });
        videoElement.srcObject = mediaStream;
    });

    // Initialize camera on load
    startCamera();
});
