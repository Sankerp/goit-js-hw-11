import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  gallery: document.querySelector('.gallery'),
  form: document.querySelector('.search-form'),
  loadScroll: document.querySelector('.loadScroll'),
};

elements.form.addEventListener('submit', handlerSubmit);

async function handlerSubmit(event) {
  event.preventDefault();
  querry = elements.form.elements.searchQuery.value;
  page = 1;
  observer.unobserve(elements.loadScroll);
  elements.gallery.innerHTML = '';
  const result = await pictureSearch();
  if (!result.totalHits) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notiflix.Notify.info(`Hooray! We found ${result.totalHits} images.`);
    createMarkup(result.hits);
    maxPage = Math.ceil(result.totalHits / 40);
  }
  if (maxPage > 1) {
    observer.observe(elements.loadScroll);
  }
  elements.form.reset();
}

let lightbox = new SimpleLightbox('.gallery a');
let page;
let querry;
let maxPage;
let observer = new IntersectionObserver(onObserver);

async function pictureSearch() {
  const BASE_URL = 'https://pixabay.com/api';
  const API_KEY = '37674283-63cb49660a0badf2685ca236d';
  const Parameters = new URLSearchParams({
    key: API_KEY,
    q: querry,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 40,
  });
  const fullUrl = `${BASE_URL}/?${Parameters}`;
  const response = await axios.get(fullUrl);
  if (response.status !== 200) {
    throw new Error(response.status);
  }
  return response.data;
}

function createMarkup(array) {
  const markUp = array
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
        <a href="${largeImageURL}">
          <img class="photo-image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b><span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b><span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b><span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b><span>${downloads}</span>
        </p>
    </div>
    </div>`;
      }
    )
    .join('');
  elements.gallery.insertAdjacentHTML('beforeend', markUp);
  lightbox.refresh();
}

async function handlerLoadMore() {
  page += 1;
  if (page > maxPage) {
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    const nextPictures = await pictureSearch();
    createMarkup(nextPictures.hits);
    window.scrollBy({
      top: 500,
      behavior: 'smooth',
    });
  }
}

function onObserver(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      handlerLoadMore();
    }
  });
}
