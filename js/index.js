require('../css/index.css')
require('font-awesome/css/font-awesome.css')
const particlesJS = require('exports?particlesJS!particles.js')
import lunr from 'lunr'
import price from './price'

const createAssciimaPlayer = function(num) {
  asciinema_player.core.CreatePlayer(
    'asciicast' + num,
    '/assets/asciicast/case' + num + '.json',
    { width: 181, height: 18, speed: 7 }
  )
}

// Pick from underscore
const debounce = function(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

const initCloudAnimate = () => {
  const items = $('#index .map .item')
  if (!items.length) return
  let idx = 0
  setInterval(() => {
    for (let item of items) $(item).removeClass('active')
    $(items[idx]).addClass('active')
    if (++idx >= items.length) idx = 0
  }, 5000)
}

const setPrice = (type) => {
  const elem = $('#index .prices .detail')
  if (!elem.length) return
  const detail = price[type]
  elem.find('.type').text(type)
  elem.find('.cpu').text(detail.cpu)
  elem.find('.mem').text(detail.mem)
  elem.find('.disk').text(detail.disk)
  elem.find('.net').text(detail.net)
  elem.find('.month').text(`${detail.month} / Month`)
  elem.find('.second').text(`${detail.second} / Second`)
}

const initPriceSlider = () => {
  const items = $('#index .prices .slider .item')
  if (!items.length) return
  items.hover(function() {
    items.removeClass('active')
    $(this).addClass('active')
    const type = $(this).find('.type').text()
    setPrice(type)
  })
}

const initTab = (id) => {
  const items = $(`#${id} .tabs > .items .item`)
  if (!items.length) return
  items.hover(function() {
    items.removeClass('active')
    $(this).addClass('active')
    $(`#${id} .detail`).removeClass('active')
    $(`#${id} .detail.detail-${$(this).index()}`).addClass('active')
  })
}

const delay = async (func, time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      func()
      resolve()
    }, time)
  })
}

const initTyping = async () => {
  $('.line-1').addClass('active')
  await delay(() => $('.line-2').addClass('active'), 2000)
  await delay(() => $('.line-3').addClass('active'), 2000)
  await delay(() => $('.line-4').addClass('active'), 2000)
  await delay(() => $('.result-1').addClass('active'), 2000)
  await delay(() => $('.line-5').addClass('active'), 200)
  await delay(() => $('.result-2').addClass('active'), 3000)
}

const initArticlesSearch = async () => {
  if (!$('#howto').length) return
  const articles = await $.getJSON('/howto/index.json')
  let db = lunr(function() {
    this.field('title', { boost: 10 })
    this.field('content')
  })
  articles.forEach((article, idx) => {
    db.add({
      id: idx,
      title: article.title,
      content: article.content
    })
  })
  const itemTpl = (title, preview, link) => {
    return `
    <li class="article">
        <a class="title" href="/howto/${link}">${title}</a>
        <section class="preview content">${preview}...</section>
    </li>
    `
  }
  const oriHtml = $('#howto .article-list').html()
  $('#search').on('input', debounce(function() {
    const keyword = $(this).val().trim()
    const results = db.search(keyword)
    if (results.length) {
      let retHtml = ''
      results.forEach((result) => {
        const item = articles[result.ref]
        const itemHtml = itemTpl(item.title, item.preview, item.link)
        retHtml += itemHtml
      })
      $('#howto .page-nav').hide()
      $('#howto .article-list').html(retHtml)
    } else {
      if (keyword) {
        $('#howto .page-nav').hide()
        $('#howto .article-list').html(`<div class="empty">No Results for "<span>${keyword}</span>"</div>`)
      } else {
        $('#howto .page-nav').show()
        $('#howto .article-list').html(oriHtml)
      }
    }
  }, 500))
}

const initSignup = () => {
  document.signup.onsubmit = (event) => {
    event.preventDefault()
    try {
      const data = btoa(encodeURI(JSON.stringify({
        firstName: document.signup.firstname.value,
        lastName: document.signup.lastname.value,
        email: document.signup.email.value,
        password: document.signup.password.value
      })))
      location.href = `https://console.hyper.sh/register/${data}`
    } catch(err) {
      location.href = `https://console.hyper.sh/register`
    }
  }
}

const initBackground = () => {
  try {
    if ($('#background').length) {
      particlesJS.load('background', '/assets/particles.json')
    }
  } catch(err) {}
}

const bindEvents = () => {
  $('#header .nav-toggle').click(evt => $('#header nav').toggleClass('show'))
}

$(() => {
  bindEvents()
  initBackground()
  initPriceSlider()
  initTab('features')
  initTab('howto')
  initArticlesSearch()
  setPrice('M')
  initSignup()
  // initCloudAnimate()
  // initTyping()
  // createAssciimaPlayer(1)
  // createAssciimaPlayer(2)
  // createAssciimaPlayer(3)
  // createAssciimaPlayer(4)
})