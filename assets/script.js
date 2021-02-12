(() => {
  // VARIABLES
  // template helper
  const showTemplate = document.querySelector('.templatename');

  // product page variables
  const productFormInputs = [...document.querySelectorAll('input[type="radio"]')];
  const productVariants = document.querySelector('select[name="id"]') ?
  Array.from(document.querySelector('select[name="id"]')?.children) :
  undefined;
  let chosenProductOptions = [null, null];

  // collection page
  const sortCollectionChoices = [...document?.querySelectorAll('.collection-filter__list-item')]
  .map( el => el.getAttribute('value'));
  const paginationInput = document?.querySelector('#pagination-input');
  
  // cart page variables
  const cartItemQuantityButtons = document.querySelectorAll('.cart__form-quantity-button');
  const cartItemRemoveButtons = document.querySelectorAll('.cart__item-remove');
  const cartItemPrices = [...document?.querySelectorAll('#itemPrice')];

  // FUNCTIONS

  // collection pages

  const filterProductView = (sortValue) => {
    const url = location.href;
    if ( isNaN(parseInt(sortValue)) ) {
      const baseUrl = url.split('sort_by=')[0];
      location.assign(`${baseUrl}sort_by=${sortValue}`);
    } else {
      const newUrl = `${url.split('?view=')[0]}?view=${sortValue}`;
      location.assign(newUrl);
    }
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

  const selectProductVariant = () => {
    const selectedVariant = productVariants.find( (option) => {
      const variantData = option.id.split(' / ');
      return filterVariant(variantData);
    });

    if (selectedVariant) {
      productVariants.forEach( option => option.removeAttribute('selected'));
      selectedVariant.setAttribute('selected', '');
    }
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
      filterProductView(targetElement.getAttribute('name'));
      button.blur();
    }

  };

  const updateCartItemData = async (item, quantity) => {
    const lineItemKey = item.dataset.lineItemKey;
    if ( !lineItemKey ) { return };

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

    const newCartTotal = await result.total_price;
    const newCartItemData = await result.items[lineItemKey];
    updateCartTotal(newCartTotal);
    updateCartItemPrice(lineItemKey, newCartItemData);
  };

  const updateCartItemPrice = (index, newCartItemData) => {
    if ( newCartItemData ) {
      const newPrice = (newCartItemData.line_price / 100)
        .toString()
        .replace('.', ',');
      cartItemPrices[index].innerHTML =  newPrice;
    }
  };

  const updateCartTotal = (newCartTotal) => {
    const newTotal = (newCartTotal / 100)
    .toString()
    .replace('.', ',');
    document.querySelector('#cart-total').innerHTML = newTotal;
  };

  // LISTENERS

  // product page
  productFormInputs?.forEach( (input) => {
    input.addEventListener('input', () => setChosenProductOptions());
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


  // template helper
  window.addEventListener('mousemove', (e) => {
    if (e.clientY < 1 && e.clientX < 1 && showTemplate.style.display === "block") {
      showTemplate.style.display = 'none';
    } else if (e.clientY < 1 && e.clientX < 1 ) {
      showTemplate.style.display = 'block';
    }
  });

})();