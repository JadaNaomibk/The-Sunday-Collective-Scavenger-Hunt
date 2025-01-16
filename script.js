// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Mobile menu toggle
    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuButton) {
        menuButton.addEventListener("click", function () {
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

    const playerNameInput = document.getElementById("playerName");
    const saveUsernameButton = document.getElementById("saveUsername");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const thankYouMessage = document.getElementById("thankYouMessage");

    let mediaStream = null;
    let mediaRecorder = null;
    let isRecording = false;
    let photoCount = 0;
    let videoCount = 0;
    const maxPhotos = 20;
    const maxVideos = 3;
    const maxVideoDuration = 3 * 60 * 1000;

    // Username management
    window.addEventListener("DOMContentLoaded", () => {
        const savedUsername = localStorage.getItem("scavengerHuntUsername");
        if (savedUsername) {
            usernameDisplay.textContent = `Username: ${savedUsername}`;
            playerNameInput.style.display = "none";
            saveUsernameButton.style.display = "none";
        }
    });

    saveUsernameButton.addEventListener("click", () => {
        const username = playerNameInput.value.trim();
        if (username) {
            localStorage.setItem("scavengerHuntUsername", username);
            usernameDisplay.textContent = `Username: ${username}`;
            playerNameInput.style.display = "none";
            saveUsernameButton.style.display = "none";
        } else {
            alert("Please enter a valid username.");
        }
    });

    // Request access to the user's camera
    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: true,
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

        // Update admin.html with the captured photo
        uploadImageToAdmin(imageUrl);

        // Prepare for server upload
        uploadImageToServer(imageUrl);

        // Increment photo count and alert remaining photos
        photoCount++;
        alert(`You have ${maxPhotos - photoCount} photos remaining.`);
    });

    // Update admin.html with the captured photo
    function uploadImageToAdmin(imageUrl) {
        const adminPhotosKey = "adminPhotos";
        const adminPhotos = JSON.parse(localStorage.getItem(adminPhotosKey)) || [];

        // Store the photo in localStorage
        adminPhotos.push(imageUrl);
        localStorage.setItem(adminPhotosKey, JSON.stringify(adminPhotos));

        // Dynamically add the photo to admin.html if it's open
        const adminPhotoGallery = document.getElementById("adminPhotoGallery");
        if (adminPhotoGallery) {
            const img = document.createElement("img");
            img.src = imageUrl;
            adminPhotoGallery.appendChild(img);
        }
    }

    // Upload photo or video to server
    async function uploadImageToServer(imageUrl) {
        const username = localStorage.getItem("scavengerHuntUsername") || "Anonymous";
        const formData = new FormData();
        // Convert data URL to Blob
        const blob = dataURItoBlob(imageUrl);
        formData.append("image", blob, "photo.png");
        formData.append("username", username);

        try {
            const response = await fetch("/admin/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                alert("Image uploaded successfully!");
                console.log("File URL:", result.fileUrl);
            } else {
                alert("Image upload failed.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        }
    }

    // Convert a data URL to a Blob
    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(",")[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }

        return new Blob([uintArray], { type: "image/png" });
    }

    // Handle upload button click
    uploadButton.addEventListener("click", () => {
        const username = localStorage.getItem("scavengerHuntUsername") || "Anonymous";
        console.log(`Uploading photos/videos for username: ${username}`);

        thankYouMessage.style.display = "block";
        setTimeout(() => {
            thankYouMessage.style.display = "none";
        }, 3000);
    });

    // Other pre-existing functionality like video recording, switching cameras, etc.

    // Initialize camera on load
    startCamera();
});
