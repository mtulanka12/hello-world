document.addEventListener('DOMContentLoaded', () => {
    const categoriesContainer = document.getElementById('categories-container');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const previewContent = document.getElementById('preview-content');

    let menuData = [];

    // Function to load menu data from URL query parameter
    function loadMenuFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const menuQueryParam = params.get('menu');

        if (menuQueryParam) {
            try {
                // Decode: atob then decodeURIComponent(escape()) for compatibility with the encoding scheme
                const decodedJsonString = decodeURIComponent(escape(atob(menuQueryParam)));
                const parsedMenuData = JSON.parse(decodedJsonString);

                if (Array.isArray(parsedMenuData)) { // Basic validation
                    menuData = parsedMenuData; // Set the global menuData
                    // console.log("Menu data loaded from URL:", menuData); // For debugging
                } else {
                    console.warn("Parsed menu data from URL is not an array.");
                }
            } catch (error) {
                console.error("Error loading or parsing menu data from URL:", error);
                alert("Could not load menu data from the link. The link might be corrupted or invalid.");
                // Optionally, clear the menu query param to avoid repeated errors on refresh
                // window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }

    function renderLivePreview() {
        if (!previewContent) return;
        previewContent.innerHTML = '';

        if (menuData.length === 0) {
            previewContent.innerHTML = '<p>Your menu will appear here as you build it.</p>';
            return;
        }

        menuData.forEach(category => {
            if (!category.name && category.items.length === 0) return;

            const categoryPreviewDiv = document.createElement('div');
            categoryPreviewDiv.classList.add('preview-category');

            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.name || 'Unnamed Category';
            categoryPreviewDiv.appendChild(categoryTitle);

            const itemsPreviewList = document.createElement('ul');
            itemsPreviewList.classList.add('preview-items-list');

            category.items.forEach(item => {
                const itemLi = document.createElement('li');
                itemLi.classList.add('preview-item');

                const itemName = document.createElement('strong');
                itemName.textContent = item.name || 'Unnamed Item';

                const itemPrice = document.createElement('span');
                itemPrice.classList.add('preview-item-price');
                const price = parseFloat(item.price);
                itemPrice.textContent = !isNaN(price) ? `$${price.toFixed(2)}` : '$--.--';

                const itemDescription = document.createElement('p');
                itemDescription.classList.add('preview-item-description');
                itemDescription.textContent = item.description || '';

                itemLi.appendChild(itemName);
                itemLi.appendChild(document.createTextNode(' - '));
                itemLi.appendChild(itemPrice);
                if (item.description) {
                    itemLi.appendChild(itemDescription);
                }

                itemsPreviewList.appendChild(itemLi);
            });

            categoryPreviewDiv.appendChild(itemsPreviewList);
            previewContent.appendChild(categoryPreviewDiv);
        });
    }

    function renderItem(item, categoryIndex, itemIndex) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.setAttribute('data-item-index', itemIndex);

        const itemNameInput = document.createElement('input');
        itemNameInput.type = 'text';
        itemNameInput.placeholder = 'Item Name (e.g., Spring Rolls)';
        itemNameInput.value = item.name;
        itemNameInput.addEventListener('change', (e) => {
            menuData[categoryIndex].items[itemIndex].name = e.target.value;
            renderLivePreview();
        });

        const itemDescriptionTextarea = document.createElement('textarea');
        itemDescriptionTextarea.placeholder = 'Description (optional)';
        itemDescriptionTextarea.value = item.description;
        itemDescriptionTextarea.rows = 2;
        itemDescriptionTextarea.addEventListener('change', (e) => {
            menuData[categoryIndex].items[itemIndex].description = e.target.value;
            renderLivePreview();
        });

        const itemPriceInput = document.createElement('input');
        itemPriceInput.type = 'number';
        itemPriceInput.placeholder = 'Price';
        itemPriceInput.value = item.price;
        itemPriceInput.min = '0';
        itemPriceInput.step = '0.01';
        itemPriceInput.addEventListener('change', (e) => {
            menuData[categoryIndex].items[itemIndex].price = parseFloat(e.target.value);
            renderLivePreview();
        });

        const removeItemBtn = document.createElement('button');
        removeItemBtn.textContent = 'Remove Item';
        removeItemBtn.classList.add('remove-item-btn');
        removeItemBtn.addEventListener('click', () => {
            removeItem(categoryIndex, itemIndex);
        });

        itemDiv.appendChild(itemNameInput);
        itemDiv.appendChild(itemDescriptionTextarea);
        itemDiv.appendChild(itemPriceInput);
        itemDiv.appendChild(removeItemBtn);

        return itemDiv;
    }

    function renderCategory(category, index) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.setAttribute('data-category-index', index);

        const categoryNameInput = document.createElement('input');
        categoryNameInput.type = 'text';
        categoryNameInput.placeholder = 'Category Name (e.g., Appetizers)';
        categoryNameInput.value = category.name;
        categoryNameInput.addEventListener('change', (e) => {
            menuData[index].name = e.target.value;
            renderAllCategories();
            renderLivePreview();
        });

        const removeCategoryBtn = document.createElement('button');
        removeCategoryBtn.textContent = 'Remove Category';
        removeCategoryBtn.classList.add('remove-category-btn');
        removeCategoryBtn.style.float = 'right';
        removeCategoryBtn.addEventListener('click', () => {
            removeCategory(index);
        });

        const itemsContainer = document.createElement('div');
        itemsContainer.classList.add('items-container');
        category.items.forEach((item, itemIndex) => {
            const itemElement = renderItem(item, index, itemIndex);
            itemsContainer.appendChild(itemElement);
        });

        const addItemBtn = document.createElement('button');
        addItemBtn.textContent = 'Add Item to this Category';
        addItemBtn.classList.add('add-item-to-category-btn');
        addItemBtn.addEventListener('click', () => {
            addItem(index);
        });

        categoryDiv.appendChild(categoryNameInput);
        categoryDiv.appendChild(removeCategoryBtn);
        categoryDiv.appendChild(itemsContainer);
        categoryDiv.appendChild(addItemBtn);

        return categoryDiv;
    }

    function renderAllCategories() {
        categoriesContainer.innerHTML = '';
        menuData.forEach((category, index) => {
            const categoryElement = renderCategory(category, index);
            categoriesContainer.appendChild(categoryElement);
        });
        renderLivePreview();
    }

    function addCategory() {
        const newCategory = {
            name: '',
            items: []
        };
        menuData.push(newCategory);
        renderAllCategories();
    }

    function removeCategory(categoryIndex) {
        menuData.splice(categoryIndex, 1);
        renderAllCategories();
    }

    function addItem(categoryIndex) {
        const newItem = {
            name: '',
            description: '',
            price: ''
        };
        if (menuData[categoryIndex]) {
            menuData[categoryIndex].items.push(newItem);
            renderAllCategories();
        }
    }

    function removeItem(categoryIndex, itemIndex) {
        if (menuData[categoryIndex] && menuData[categoryIndex].items[itemIndex]) {
            menuData[categoryIndex].items.splice(itemIndex, 1);
            renderAllCategories();
        }
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addCategory);
    }

    loadMenuFromUrl(); // Load menu data from URL first

    renderAllCategories(); // This will now use loaded data and also call renderLivePreview

    const generateMenuBtn = document.getElementById('generate-menu-btn');
    const menuUrlOutput = document.getElementById('menu-url-output');
    const outputLinkContainer = document.getElementById('output-link-container');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');

    let currentMenuUrl = '';

    function generateQrCode(url) {
        if (!qrCodeContainer || typeof QRCode === 'undefined') {
            console.error("QR code container or QRCode library not found.");
            return;
        }
        qrCodeContainer.innerHTML = '';
        new QRCode(qrCodeContainer, {
            text: url,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        if (downloadQrBtn) {
            downloadQrBtn.style.display = 'inline-block';
        }
    }

    function downloadQrCodeImage() {
        if (!qrCodeContainer) return;
        const qrCanvas = qrCodeContainer.querySelector('canvas');
        const qrImage = qrCodeContainer.querySelector('img');

        let dataUrl = '';
        if (qrCanvas) {
            dataUrl = qrCanvas.toDataURL('image/png');
        } else if (qrImage) {
            if (qrImage.src.startsWith('data:image')) {
                 dataUrl = qrImage.src;
            } else {
                const canvas = document.createElement('canvas');
                canvas.width = qrImage.width;
                canvas.height = qrImage.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(qrImage, 0, 0);
                dataUrl = canvas.toDataURL('image/png');
            }
        }

        if (dataUrl) {
            const link = document.createElement('a');
            link.download = 'QuickMenu-QR.png';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("Could not download QR code. Please try generating the menu again.");
        }
    }

    function generateMenuUrl() {
        if (menuData.length === 0) {
            alert("Please add at least one category and item to your menu before generating a link.");
            return;
        }

        try {
            const jsonString = JSON.stringify(menuData);
            const encodedData = btoa(unescape(encodeURIComponent(jsonString)));

            const baseUrl = window.location.origin + window.location.pathname;
            currentMenuUrl = `${baseUrl}?menu=${encodedData}`;

            if (menuUrlOutput && outputLinkContainer) {
                menuUrlOutput.value = currentMenuUrl;
                outputLinkContainer.style.display = 'block';
                generateQrCode(currentMenuUrl);
            }
        } catch (error) {
            console.error("Error generating menu URL:", error);
            alert("Could not generate menu URL. Please check your menu data or try again.");
        }
    }

    if (generateMenuBtn) {
        generateMenuBtn.addEventListener('click', generateMenuUrl);
    }

    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', downloadQrCodeImage);
    }

    if (downloadQrBtn) {
        downloadQrBtn.style.display = 'none';
    }

});
