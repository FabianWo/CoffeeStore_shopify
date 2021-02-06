(() => {

  // VARIABLES
  const showTemplate = document.querySelector('.templatename');
  const productFormInputs = [...document.querySelectorAll('input[type="radio"]')];
  const productVariants = document.querySelector('select[name="id"]') ?
    Array.from(document.querySelector('select[name="id"]')?.children) :
    undefined;
  let chosenProductOptions = [null, null];

  // FUNCTIONS

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

  // LISTENERS
  productFormInputs.forEach( (input) => {
    input.addEventListener('input', () => setChosenProductOptions());
  });

  window.addEventListener('mousemove', (e) => {
    if (e.clientY < 1 && e.clientX < 1 && showTemplate.style.display === "block") {
      showTemplate.style.display = 'none';
      console.log("hi")
    } else if (e.clientY < 1 && e.clientX < 1 ) {
      showTemplate.style.display = 'block';
      console.log("hi")
    }
  });

})();