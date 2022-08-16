import axios from 'axios'
import Notiflix from 'notiflix'
import SimpleLightbox from 'simplelightbox'
import 'simplelightbox/dist/simple-lightbox.min.css';
import '../src/sass/index.scss'

const PRIVATE_KEY = '29297133-53f634ffa16ba9bd3f8fb049c'
const HTTP_URL = 'https://pixabay.com/api/'
let page = 0
let pictures = []

const form = document.querySelector('form')
const input = document.querySelector('[name="searchQuery"]')
const gallery = document.querySelector('.gallery')
const loadMore = document.querySelector('.load-more')

function getTemplate({
                       webformatURL,
                       largeImageURL,
                       tags,
                       likes,
                       views,
                       comments,
                       downloads
                     }) {
  return `
    <a href="${largeImageURL}">
      <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
        <p class="info-item">
          <b>Likes: </b>${likes}
            </p>
          <p class="info-item">
            <b>Views: </b>${views}
          </p>
          <p class="info-item">
            <b>Comments: </b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads: </b>${downloads}
          </p>
        </div>
      </div>
    </a>
  `
}

const render = (array) => array.reduce((acc, item) => (acc += getTemplate(item)), '');

const fetchImages = async (q) => {
  try {
    loadMore.style.display = 'none'
    const response = await axios.get(HTTP_URL, {
      params: {
        key: PRIVATE_KEY,
        q,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page + 1,
        per_page: 40
      }
    })
    if (!response.data.hits.length) return Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");

    Notiflix.Notify.success(`Hooray! We found ${response.data.hits.length} images!`);

    const result = response.data.hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads
    }))

    if (pictures.length >= response.data.totalHits) {
      loadMore.style.display = 'none'
      Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
      return;
    }

    loadMore.style.display = 'block'

    return result
  } catch (error) {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
  }
}

form.addEventListener('submit', async (e) => {
  try {
    page = 0
    e.preventDefault()
    pictures = await fetchImages(input.value)
    gallery.innerHTML = render(pictures)
    new SimpleLightbox('.gallery a')
    page++
  } catch {}
})

loadMore.addEventListener('click', async () => {
  try {
    const result = await fetchImages(input.value)
    pictures = [...pictures, ...result]
    gallery.innerHTML = render(pictures)
    new SimpleLightbox('.gallery a')
    page++
  } catch {}
})