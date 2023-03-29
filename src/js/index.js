import '../scss/styles.scss';
const input = document.querySelector('.search-input');
const header = document.querySelector('.header');
const results = document.querySelector('.results');
const ph = document.querySelector('.results-item-ph');

function debounce(fn, debounceTime) {
  let debounce;
  return function (...args) {
    clearTimeout(debounce);
    return new Promise((resolve) => {
      debounce = setTimeout(
        () => resolve(fn.call(this, ...args)),
        debounceTime
      );
    });
  };
}
// https://api.github.com/search/repositories?q=${query}&per_page=5
const getRepoNames = debounce((query) => {
  return Promise.resolve()
    .then(() => {
      return fetch(
        `https://api.github.com/search/repositories?q=${query}&per_page=5`
      ).then((response) => {
        if (response.ok) return response.json();
        throw new Error(`Something went wrong ${response.status}`);
      });
    })
    .catch((e) => {
      ph.textContent = e;
      throw e;
    });
}, 400);

function renderAutocomplete(response) {
  let fragment = document.createElement(`div`);
  fragment.classList.add(`ac-container`);
  response.items.forEach((item) => {
    const autocompleteItem = document.createElement(`div`);
    autocompleteItem.classList.add('ac-item');
    autocompleteItem.textContent = item.name;
    autocompleteItem.dataset.name = item.name;
    autocompleteItem.dataset.owner = item.owner.login;
    autocompleteItem.dataset.stars = item.stargazers_count;
    fragment.appendChild(autocompleteItem);
  });
  header.appendChild(fragment);
}

function deleteElement(el) {
  if (document.querySelector(el)) {
    document.querySelector(el).remove();
  }
}

function renderResultCard(target) {
  let result = document.createElement(`div`);
  result.classList.add(`results-item`);
  result.insertAdjacentHTML(
    `afterbegin`,
    `
    <div>
      <p class="result-name">Name: <span>${target.dataset.name}</span></p>
      <p class="result-owner">Owner: <span>${target.dataset.owner}</span></p>
      <p class="result-stars">Stars: <span>${target.dataset.stars}</span></p>
    </div>
      <div class="close-button close-btn-trigger">
        <div class="close-button-p1 close-btn-trigger"></div>
        <div class="close-button-p2 close-btn-trigger"></div>
      </div>
  `
  );
  results.appendChild(result);
}

input.addEventListener('input', () => {
  if (input.value.length == 0 || input.value[0] == ' ') {
    deleteElement(`.ac-container`);
  } else {
    deleteElement(`.ac-container`);
    getRepoNames(input.value).then((res) => {
      renderAutocomplete(res);
    });
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains(`ac-item`)) {
    renderResultCard(e.target);
    input.value = '';
    deleteElement(`.ac-container`);
    ph.style.display = 'none';
  }
  if (e.target.classList.contains(`close-btn-trigger`)) {
    e.target.parentElement.parentElement.remove();
    ph.style.display = 'block';
  }
});
