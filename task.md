## Overview  
OLX.uz is the premier online classifieds platform in Uzbekistan, operated by OLX Group (a subsidiary of Naspers) and relaunched from the former Torg.com in March 2015 to serve local buyers and sellers free of charge. Users can list items across categories such as “Электроника” (Electronics), “Транспорт” (Transport), and “Недвижимость” (Real Estate), with up to 12 photos per ad and optional paid promotions like VIP or Top listings. Ads may be published via the web interface at [olx.uz](https://www.olx.uz) or through the OLX mobile apps on Android and iOS, both offering a streamlined “snap, set price, post” workflow.

## Step 1: Access OLX.uz and Sign In  
1. **Open the site:** Navigate to [olx.uz](https://www.olx.uz).
2. **Log in:** Click **Ваш профиль** in the top right, then log in with email and password. To do it just enter these credentials:
- Email: ""
- Password: ""

## Step 2: Start Your Ad  
1. **Initiate a new listing:** Click **Подать объявление** (the camera icon or “Sell” button) at the top of the page to open the ad creation form.
2. **Select the channel:** You may opt to post via Web or switch to the Mobile App if preferred; both share the same core steps.

## Step 3: Choose the Right Category  
1. **Primary category:** Select **Электроника** from the main menu of categories.
2. **Subcategory:** Under Electronics, choose **телефоны** then **Мобильные телефоны** to accurately classify your iPhone.

## Step 4: Craft Your Title and Description  
1. **Title:** Enter a clear, concise headline, e.g., “iPhone 15 Pro Max 256 GB — Как новый”.
2. **Description:** Provide all key details:
   - **Состояние:** новый/б/у  
   - **Память:** 256 GB  
   - **Цвет:** Silver или Graphite  
   - **Комплектация:** оригинальная коробка, кабель USB‑C, адаптер, наушники  
   - **Гарантия:** действующая AppleCare (если есть)  
   - **Дополнительно:** фото устройства, причина продажи, контакты в WhatsApp/Telegram.

## Step 5: Photos of the product
1. Execute this javascript code in the browser console (e.g., developer tools in chrome) with the following image links:
- imageUrl1: "https://iili.io/3E2ArCl.jpg"
- imageUrl2: "https://iili.io/3E25j5X.jpg"
### Code ###:
```javascript
// 1. Select your file input element
const fileInput = document.querySelector('input[type="file"]');

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
```

Note: you must javascript two times to add two photos.

## Step 6: Type of Sale
1. **Type of Sale:** Select **Продам** from the tabs.

## Step 7: Price
1. **Price:** Enter 17500000 without any spaces or commas.

## Step 7: Switcher
1. **Switcher:** Click one time on **Договорная** switcher.

## Step 8: Add more details:
1. **business type**: on "Частный или бизнес" tabs select "Частное лицо".

## Step 9: on the tab written: "Марка телефона"
1. Select "Apple" from the dropdown menu.

## Step 10: on the tab written: "Состояние"
1. Select "Новый" from the tabs.

## Step 11: on the tab written: "Автопродление"
1. just click on switcher. the click "OK" button if needed.

## Step 12: Specify Location and Contacts  
1. **Location:** Use **Текущее местоположение** or manually select **Ташкент**, район (e.g., **Мирабадский**) to inform buyers where to meet.

## Step 13: Preview and Publish  
1. **Publish:** Click **Подать объявление** or **Опубликовать**. Your ad will go live instantly; you may share the link on social media to attract buyers faster.