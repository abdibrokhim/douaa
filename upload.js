const fileInput = document.querySelector('input[type="file"]');
const imageUrls = [
    "https://iili.io/3E2ArCl.jpg",
    "https://iili.io/3E25j5X.jpg"
]

// Note: we must run script twice to add two photos. 
// we can't loop through imageUrls because the fileInput element is not re-initialized.
// we must run script twice to add two photos.

// 2. Fetch the image blob from its URL (tabs 2 & 3 on OLX might expose <img> src or use canvas)
fetch('https://iili.io/3E2ArCl.jpg')           // adjust URL as needed
  .then(res => res.blob())                               // get raw binary
  .then(blob => {
    // 3. Create a File from the Blob
    const file = new File([blob], 'iphone-photo.jpg', { type: blob.type });

    // 4. Use DataTransfer to generate a FileList
    const dt = new DataTransfer();
    dt.items.add(file);

    // 5. Assign it to the input
    fileInput.files = dt.files;

    // 6. (Optional) Trigger any change handlers
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  })
  .catch(console.error);