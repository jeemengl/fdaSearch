const createAutoComplete = ({root, renderOption, onOptionSelect, inputValue, fetchData}) => {

//   HTML elements for dropdown
  

root.innerHTML = `
  <input class="input" />
  <div class="dropdown">
    <div class="dropdown-menu">
      <div class="dropdown-content results"></div>
    </div>
  </div>
`;

const input = root.querySelector('input');
const dropdown = root.querySelector('.dropdown');
const resultsWrapper = root.querySelector('.results');


// ON INPUT 

const onInput = async event => {
  const items = await fetchData(event.target.value);
  if (!items.length) {
      dropdown.classList.remove(is-active);
  };
  resultsWrapper.innerHTML = '';
  dropdown.classList.add('is-active');
  
  for (let item of items) {
    const option = document.createElement('a');
   
    option.classList.add('dropdown-item');
    option.innerHTML = renderOption(item);
  //   if clicked, add item title to search bar
    option.addEventListener('click', () => {
      dropdown.classList.remove('is-active');
      input.value = inputValue(item); 
      onOptionSelect(item);
    });


    resultsWrapper.appendChild(option);
  }
};

// adds delay before requesting API
input.addEventListener('input', debounce(onInput, 500));


//   remove dropdown if no matches
document.addEventListener('click', event => {
  if (!root.contains(event.target)) {
      dropdown.classList.remove('is-active')
  }
} )


}