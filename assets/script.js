(() => {
  // ----- VARIABLES -----
  // general

  // template helper
  const showTemplate = document.querySelector('.templatename');

  // navigation
  const navSearch = document.querySelector('.nav__searchbar');
  const navSearchInput = document.querySelector('.searchbar__input');
  const navSearchPreview = document.querySelector('.searchbar__preview-wrapper');

  const mobileButton = document.querySelector('.nav-mobile-button');
  const bottomNavigation = document.querySelector('.nav-container-bottom');

  // product page variables
  const productFormInputs = [...document.querySelectorAll('input[type="radio"]')];
  const productVariants = document.querySelector('select[name="id"]') ?
  Array.from(document.querySelector('select[name="id"]')?.children) :
  undefined;
  let chosenProductOptions = [null, null];
  const [productPrice, productPerKgPrice] = [document.querySelector('.product__price'),
  document.querySelector('.product__per-kg-price')];
  const productImagesWrapper = document.querySelector('.product__images-wrapper');
  const productMainImage = document.querySelector('.product__main-image');
  const productMainImageZoomedWrapper = document.querySelector('.product__main-image-zoomed-wrapper');
  const productMainImageZoomed = document.querySelector('.product__main-image-zoomed');

  // collection page
  const sortCollectionChoices = [...document?.querySelectorAll('.collection-filter__list-item')]
  .map( el => el.getAttribute('value'));
  const paginationInput = document?.querySelector('#pagination-input');
  const allDisplayedProducts = [...document?.querySelectorAll('.collection__product-card')];
  const paginationNavigation = document?.querySelector('.pagination-navigation');
  
  // cart page variables
  const cartItemQuantityButtons = document.querySelectorAll('.cart__form-quantity-button');
  const cartItemRemoveButtons = document.querySelectorAll('.cart__item-remove');
  const cartItemPrices = [...document?.querySelectorAll('#itemPrice')];

  // ----- FUNCTIONS -----

  // navigation

  // navigation bar search preview under the search tab
  const getNavSearchPreview = async (e, closePreviewOnBlur) => {
    if ( e.target.value.length < 1 && navSearchPreview.innerHTML !== '' || closePreviewOnBlur ) {
      navSearchPreview.innerHTML = '';
      return;
    } else if ( e.target.value.length < 1 ) {
      return;
    }
    console.log('object');
    const previewElements =
    await fetch(`/search/suggest.json?q=${e.target.value}&resources[type]=product`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
    const results = await previewElements.resources.results.products;  

    let previewContents = '';
    results.forEach( (el) => {
      previewContents += 
      `
      <a class="searchbar__preview-link" href="${el.url}">
        <div class="searchbar__preview-element">
          <img class="searchbar__preview-image" src="${el.image}" alt="${el.title}">
          <span class="searchbar__preview-heading">${el.title}</span>        
        </div>
      </a>
      `;
    });

    navSearchPreview.innerHTML = previewContents;
  };

  // collection pages

  // initialite pagination on collection pages
  const paginateOnPageLoad = () => {
    const url = location.href;
    if ( !paginationNavigation ||
      ( url.includes('search') && allDisplayedProducts.length === 0) ) {
      paginationNavigation.remove();
      return;
    }
    
    const pageNumber = url.includes('viewPage=') ?
    parseInt( url.match(/viewPage=[0-9]+/g)[0].split('viewPage=')[1] ) :
    0;
    const paginateByIndex = url.includes('view=') ?
    parseInt( url.match(/view=[0-9]+/g)[0].split('view=')[1] ) :
    25;

    if (paginateByIndex) {
      document.querySelector('[name="displayPagination"]').innerHTML = paginateByIndex;
      handleProductView(paginateByIndex, pageNumber);
    }
  };

  // show/hide products depending on view, pagenumber variables from querystring
  const handleProductView = (paginateByIndex, pageNumber) => {
    const productParts = [];

    for (let i = 0; i < allDisplayedProducts.length; i ) {
      const part = allDisplayedProducts.slice(i, i + paginateByIndex);
      productParts.push(part);
      i = (i + paginateByIndex);
    }

    if (productParts.length === 0) {
      paginationNavigation.remove();
      return;
    } else if ( !productParts[pageNumber] ) {
      location.assign(location.href.replace(/viewPage=[0-9]+/g, 'viewPage=0'));
      return;
    } 

    allDisplayedProducts.forEach( (el) => el.style.display = 'none');
    productParts[pageNumber].forEach(el => el.style.display = 'flex');

    if (productParts.length >=2) {
      handlePaginationLinks(productParts);
    } else {
      paginationNavigation.remove();
    }
  };

  // create pagination navigation menu at the bottom of collection page
  const handlePaginationLinks = (productParts) => {
    const relativeUrl = location.href.split('.com')[1];
    const currentpage = relativeUrl.includes('viewPage') ?
    parseInt(relativeUrl.match(/viewPage=[0-9]+/g)[0].split('=')[1]) :
    0;

    const getpageNumberUrl = (pageIndex) => {
      let newUrl;
      if (pageIndex < 1) pageIndex = 0;
      if (relativeUrl.includes('?') && relativeUrl.includes('viewPage=')) {
        newUrl = relativeUrl.replace(/viewPage=[0-9]+&?/g, `viewPage=${pageIndex}&`);
      } else if (relativeUrl.includes('?')) {
        newUrl = relativeUrl.replace(/\?/g, `?viewPage=${pageIndex}&`);
      } else if (!relativeUrl.includes('?')) {
        newUrl = relativeUrl.concat(`?viewPage=${pageIndex}&`);
      }
      return newUrl;
    };

    let navigationContents;
    
    navigationContents = 
    currentpage > 0 ?
    `<a class="text-black pagination__link" href="${getpageNumberUrl(currentpage-1)}" title=""><</a>` :
    '<span class="text-black pagination__link" style="pointer-events: none"><</span>';
    
    productParts.forEach( (part, i) => {
      navigationContents += 
      `
      <a value="page${i}" class="text-black pagination__link" href="${getpageNumberUrl(i)}" title="">${i+1}</a>
      
      `;
    });
    
    navigationContents += 
    currentpage < (productParts.length-1) ?
    `<a class="text-black pagination__link" href="${getpageNumberUrl(currentpage)}" title="">></a>` :
    '<span class="text-black pagination__link" style="pointer-events: none">></span>';

    paginationNavigation.innerHTML = navigationContents;
    document.querySelector(`a[value=page${currentpage}]`).setAttribute('selected', '');
  };
  
  // get old querystrings and replace query that matches user input
  const createCollectionUrl = (sortValue) => {
    const baseUrl = location.href.split('?')[0];
    console.log(baseUrl);
    const url = location.href;
    
    // get current querystrings
    let viewNumber = url.includes('view=') ? url.match(/view=[0-9]+/g)[0] : '';
    let sortBy = url.includes('sort_by=') ? url.match(/sort_by=[^&]*/g)[0] : '';
    let pageNumber = url.includes('viewPage=') ? url.match(/viewPage=[0-9]+/g)[0] : '';
    let searchValue = url.includes('q=') ? url.match(/q=[^&]*/g)[0] : '';
    
    // assign new Value
    if ( isNaN(parseInt(sortValue)) ) {
      sortBy = `sort_by=${sortValue}`;
    } else if ( parseInt(sortValue) ) {
      viewNumber = `view=${sortValue}`;
    }
    
    // build new Url
    let queries = [searchValue, pageNumber, sortBy, viewNumber].filter(el => el.length > 0);
    let newUrl = `${baseUrl}?${queries.join('&')}`;

    location.assign(newUrl);
  };

  // product page
  const setChosenProductOptions = () => {
    let newchosenProductOptions = [];

    productFormInputs.forEach( (input) => {
      input.checked ? newchosenProductOptions.push(input.getAttribute('value')) : null;
    });
    chosenProductOptions = newchosenProductOptions;
    selectProductVariant();
  };

  const filterVariant = (variantData) => {
    let variantIsMatching;

    for (let i = 0; i < chosenProductOptions.length; i++) {
      if ( chosenProductOptions.includes(variantData[i]) ) {
        variantIsMatching = true;
      } else {
        variantIsMatching = false;
        break;
      }
    }
    return variantIsMatching;
  };

  const updateProductPrice = async(selectedVariant) => {
    const productHandle = document.querySelector('.product__handle').id;

    const prices = await fetch(`/products/${productHandle}.js`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await prices.json();

    const variantData = data.variants.find(el => selectedVariant.id === el.title);
    const newPrice = (variantData.price / 100).toString().replace('.', ',');
    const newPerKgPrice = (variantData.unit_price / 100).toString().replace('.', ',');

    productPrice.innerHTML = `- ${newPrice} €`;
    productPerKgPrice.innerHTML = `( ${newPerKgPrice} € / kg )`;

  };

  const selectProductVariant = () => {
    const selectedVariant = productVariants.find( (option) => {
      const variantData = option.id.split(' / ');
      return filterVariant(variantData);
    });
    console.log(selectedVariant)
    if (selectedVariant) {
      productVariants.forEach( option => option.removeAttribute('selected'));
      selectedVariant.setAttribute('selected', '');
    }

    updateProductPrice(selectedVariant);
  };

  // dropdown selectors on cart, product, collection pages
  const handleQuantitySelect = (e, button) => {
    const targetElement = e.target;
    const newValue = targetElement.getAttribute('value');
    const input = button.querySelector('input');
    const displayElement = button.querySelector('#displayValue');

    if ( targetElement.tagName === 'LI' && newValue > 0 && newValue < 10 && input.getAttribute('type') === 'number') {
      input.value = newValue;
      displayElement.innerHTML = `${newValue}`;
      updateCartItemData(button, newValue);
      button.blur();
    }

    else if ( targetElement.tagName === 'LI' && input.getAttribute('type') === 'text' 
    && sortCollectionChoices.includes(newValue) ) {
      input.value = newValue;
      displayElement.innerHTML = newValue;
      createCollectionUrl(targetElement.getAttribute('name'));
      button.blur();
    }
  };

  const updateCartItemData = async (item, quantity) => {
    const lineItemKey = item.dataset.lineItemKey;
    if ( !lineItemKey ) return;

    const variantId = parseInt(item.getAttribute('value'));
    const newVariantQuantity = quantity;
    const newData = {
      updates: {
        [variantId]: newVariantQuantity,
      }
    };

    const updateData = await fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newData)
    });
    const result = await updateData.json();

    const newCartTotal = result.total_price;
    const newCartItemData = result.items[lineItemKey];
    updateCartTotal(newCartTotal);
    updateCartItemPrice(lineItemKey, newCartItemData);
  };

  const updateCartItemPrice = (index, newCartItemData) => {
    if ( newCartItemData ) {
      const newPrice = (newCartItemData.line_price / 100).toString().replace('.', ',');
      cartItemPrices[index].innerHTML =  newPrice;
    }
  };

  const updateCartTotal = (newCartTotal) => {
    const newTotal = (newCartTotal / 100).toString().replace('.', ',');
    document.querySelector('#cart-total').innerHTML = newTotal;
  };

  // ----- LISTENERS -----

  // navigation
  navSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchValue = navSearch.querySelector('.searchbar__input').value;
    location.assign(`${location.origin}/search?q=${searchValue}`);
  });

  mobileButton.addEventListener('click', (e) => {
    const translateDirection = e.clientX;
    console.log(translateDirection);
    if (translateDirection > 150) {
      bottomNavigation.style.transform = 'translateX(0%)';
      mobileButton.removeAttribute('selected');
    } else {
      bottomNavigation.style.transform = 'translateX(70%)';
      mobileButton.setAttribute('selected', '');
    }
  });

  navSearchInput.addEventListener('focus', (e) => {
    getNavSearchPreview(e);
  });
  navSearchInput.addEventListener('input', (e) => {
    getNavSearchPreview(e);
  });
  navSearchInput.addEventListener('blur', (e) => {
    if ( !e.relatedTarget?.attributes.class.nodeValue.includes('searchbar') )
    getNavSearchPreview(e, true);
  });

  // product page
  productFormInputs?.forEach( (input) => {
    input.addEventListener('input', () => setChosenProductOptions());
  });

  productMainImageZoomedWrapper?.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 800) return;
    const zoomScale = productMainImageZoomed.clientWidth / e.target.clientWidth;

    const mouseX = (e.offsetX - e.target.clientWidth / 2) * zoomScale;
    productMainImageZoomed.style.marginLeft = `${- mouseX}px`;

    const mouseY = (e.offsetY - e.target.clientHeight / 2) * zoomScale;
    productMainImageZoomed.style.marginTop = `${- mouseY}px`;
  });

  productMainImage?.addEventListener('click', (e) => {
    if (window.innerWidth > 800) return;
    productImagesWrapper.style.width = `${window.innerWidth}px`;
    productImagesWrapper.style.height = `${window.innerHeight}px`;
    productImagesWrapper.style.position = `fixed`;
    productImagesWrapper.style.top = `0`;
    productImagesWrapper.style.left = `0`;
  });

  // cart page
  cartItemQuantityButtons?.forEach( (button) => {
    button.addEventListener('click', (e) => {
      button.focus();
      handleQuantitySelect(e, button);
    });
  });

  cartItemRemoveButtons?.forEach( (button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      await updateCartItemData(button, 0);
      button.closest('div[class="cart__item-wrapper"]')
      .previousElementSibling.remove();
      button.closest('div[class="cart__item-wrapper"]').remove();
    });
  });


  // template helper / window
  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) {
      bottomNavigation.style.transform = 'translateX(0%)';
      mobileButton.removeAttribute('selected');
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (e.clientY < 1 && e.clientX < 1 && showTemplate.style.display === "block") {
      showTemplate.style.display = 'none';
    } else if (e.clientY < 1 && e.clientX < 1 ) {
      showTemplate.style.display = 'block';
    }
  });


  // ----- IMMEDIATE FUNCTION CALLS -----
  if ( paginationInput ) {
    paginateOnPageLoad();
  }

})();