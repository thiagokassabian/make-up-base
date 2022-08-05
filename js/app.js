const catalogEl = document.querySelector('.catalog')
const filterSortEl = document.getElementById('sort-type')
const filterBrandEl = document.getElementById('filter-brand')
const filterTypeEl = document.getElementById('filter-type')
const filterNameEl = document.getElementById('filter-name')

let allProducts = []
let brands = []
let types = []
let productsEl = []

!(async function () {
	const response = await fetch('../data/products.json')
	loadProducts(await response.json(), filterSortEl.value)
})()

function loadProducts(json, sortType) {
	let view = sortProducts(json, sortType).map(p => productItem(p)).join('')
	catalogEl.innerHTML = view

	productsEl = Array.from(document.querySelectorAll('.product'))

	loadOptions(filterBrandEl, brands.uniq().sort())
	loadOptions(filterTypeEl, types.uniq().sort())

	allProducts = json
}

function loadOptions(select, data) {
	data.map(option => {
		select.insertAdjacentHTML('beforeend', `<option>${option}</option>`)
	})
}

function sortProducts(products, sortType) {
	switch (sortType) {
		case "Melhores Avaliados":
			return products.sort((a, b) => b.rating - a.rating);
		case "Menores Preços":
			return products.sort((a, b) => a.price - b.price);
		case "Maiores Preços":
			return products.sort((a, b) => b.price - a.price);
		case "A-Z":
			return products.sort((a, b) => {
				let fa = a.name.toLowerCase().trim(),
					fb = b.name.toLowerCase().trim();
				return fa > fb ? 1 : fa < fb ? -1 : 0
			});
		case "Z-A":
			return products.sort((a, b) => {
				let fa = a.name.toLowerCase().trim(),
					fb = b.name.toLowerCase().trim();
				return fa > fb ? -1 : fa < fb ? 1 : 0
			});
	}
}

const processChange = debounce(() => loadFilters());
filterNameEl.addEventListener('keyup', processChange)
filterTypeEl.addEventListener('change', loadFilters)
filterBrandEl.addEventListener('change', loadFilters)
filterSortEl.addEventListener('change', () => {
	loadProducts(allProducts, filterSortEl.value)
	loadFilters()
})

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => { func.apply(this, args); }, timeout);
	}
}

function loadFilters() {
	const name = filterNameEl.value
	const brand = filterBrandEl.value
	const type = filterTypeEl.value

	productsEl.forEach(product => {
		validateProduct(product, name, brand, type) ? product.style.display = 'block' : product.style.display = 'none'
	})
}

function validateProduct(product, name, brand, type) {
	const search = new RegExp(name, 'i')
	const checkName = search.test(product.dataset.name)
	const checkBrand = product.dataset.brand.includes(brand)
	const checkType = product.dataset.type.includes(type)

	return checkName && checkBrand && checkType
}

//EXEMPLO DO CÓDIGO PARA UM PRODUTO
function productItem(product) {
	brands = brands.concat(product.brand)
	types.push(product.product_type)

	return `<div class="product" data-name="${product.name}" data-brand="${product.brand}" data-type="${product.product_type}" tabindex="${product.id}">
  <figure class="product-figure">
    <img src="${product.image_link}" width="215" height="215" alt="${product.name}" onerror="javascript:this.src='img/unavailable.png'">
  </figure>
  <section class="product-description">
    <h1 class="product-name">${product.name}</h1>
    <div class="product-brands"><span class="product-brand background-brand">${product.brand}</span>
<span class="product-brand background-price">R$ ${parseFloat(product.price * 5.5).toFixed(2)}</span></div>
  </section>
  <section class="product-details">
	${loadDetails(product)}
  </section>
</div>`;
}

//EXEMPLO DO CÓDIGO PARA OS DETALHES DE UM PRODUTO
function loadDetails(product) {
	const details = ['brand', 'price', 'rating', 'category', 'product_type'];

	return Object.entries(product).filter(([key, value]) => details.includes(key)).map(([key, value]) => {
		return `<div class="details-row">
        <div>${key}</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">${key != 'price' ? value : (value * 5.5).toFixed(2)}</div>
        </div>
      </div>`
	}).join('')
}

Array.prototype.uniq = function () {
	return this.filter(function (value, index, self) {
		return self.indexOf(value) === index;
	});
};