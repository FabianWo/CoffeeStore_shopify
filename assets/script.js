(() => {

  // VARIABLES
  const showTemplate = document.querySelector('.templatename');
  
  // FUNCTIONS  

  // LISTENERS
  window.addEventListener('mousemove', (e) => {
    if (e.clientY < 1 && e.clientX < 1 && showTemplate.style.display === "block") {
      showTemplate.style.display = 'none';
    } else if (e.clientY < 1 && e.clientX < 1 ) {
      showTemplate.style.display = 'block';
    }
  });

})();