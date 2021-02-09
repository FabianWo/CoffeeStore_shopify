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

  // cart page variables
  const cartItemQuantityButtons = document.querySelectorAll('.cart__form-quantity-button');
  const quantityInputs = document.querySelectorAll('input[name="updates[]"]');
  const cartItemRemoveButtons = document.querySelectorAll('.cart__item-remove');
  const cartItemPrices = [...document?.querySelectorAll('#itemPrice')];

  // FUNCTIONS

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

  // cart page
  const handleQuantitySelect = (e, button) => {
    const target = e.target;
    if (target.tagName === 'LI' && target.value > 0 && target.value < 10) {
      button.querySelector('input').value = target.value;
      updateCartItem(button, target.value);
      button.blur();
    }
  };

  const updateCartItem = async (item, quantity) => {
    const variantId = parseInt(item.getAttribute('value'));
    const newVariantQuantity = quantity;
    const lineItemKey = item.dataset.lineItemKey;
    const data = {
      updates: {
        [variantId]: newVariantQuantity,
      }
    };

    const updateData = await fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await updateData.json();

    const newCartTotal = await result.total_price;
    updateCartTotal(newCartTotal);
    const newCartItemData = await result.items[lineItemKey];
    updateCartItemPrice(lineItemKey, newCartItemData);

  };

  const updateCartItemPrice = (index, newCartItemData) => {
    const newPrice = (newCartItemData.line_price / 100)
      .toString()
      .replace('.', ',');
    cartItemPrices[index].innerHTML =  newPrice;
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
    button.addEventListener('click', (e) => {
      e.preventDefault();
      updateCartItem(button, 0);
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