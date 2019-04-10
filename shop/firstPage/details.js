let id = window.location.search.split(/=/g)[1];
let url = `https://parfumerie-99bd8.firebaseio.com/products/${id}.json`;
let cart = {};
var stock;
fetch(url)
  .then(response => response.json())
  .then(products => {
    let type = document.querySelector("#nameBrandContainer span");
    document.querySelector("#order").innerHTML = `  <button type="text" onclick="addToCart('${id}')">Cumpara</button>`
    document.querySelector("#image > img").src = products.image;
    document.querySelector("#name").innerHTML = products.name;
    document.querySelector("#brand").innerHTML = products.brand;
    document.querySelector("#description").innerHTML = products.description;
    document.querySelector("#quantity").innerHTML = `${products.milliliters} ml`;
    document.querySelector("#price").innerHTML = `${products.price} lei`;
    document.querySelector("[name='quantity']").max = `${products.stock}`;

    stock = products.stock;

    if (products.sex === "feminin") {
      type.innerHTML += " femei";
    } else if (products.sex === "masculin") {
      type.innerHTML += " barbati";
    } else {
      type.innerHTML = "unisex";
    }
    if  (products.stock == 0) {
      document.querySelector('#unavailable-product').classList.remove("hidden");
    }
  });

function getNumberOfProdInCart() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      cart = JSON.parse(this.responseText);
      var sum = 0;
      for (var i in cart) {
        if (cart[i] === null) {
          continue
        };
        sum += Number(cart[i].quantity);
      }
      document.querySelector("#nr-of-prod-in-cart").innerHTML = "(" + sum + ")";
    }
  };
  xhttp.open("GET", "https://parfumerie-99bd8.firebaseio.com/cart.json", true);
  xhttp.send();
};

function loading() {
  var load = setTimeout(showPage, 600);
}

function showPage() {
  var flkty = new Flickity('.carousel');
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").classList.remove("hidden");
  flkty.resize();
  getNumberOfProdInCart();
}

function getCart() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      cart = JSON.parse(this.responseText);
    }
  };
  xhttp.open("GET", `https://parfumerie-99bd8.firebaseio.com/cart.json`, true);
  xhttp.send();
}

function addToCart(i) {
  product = {};
  let price = document.querySelector('#price').innerHTML;
  product.image = document.querySelector("#image > img").src;
  product.name = document.querySelector('#name').innerHTML;
  product.price = parseInt(price.substring(price.length - 4, 0));
  product.quantity = document.querySelector('[name="quantity"]').value;
  product.stock = stock;
  if (Number(product.quantity) <= Number(product.stock)) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        showAdded();
        getNumberOfProdInCart();
      }
    };
    xhttp.open("PUT", `https://parfumerie-99bd8.firebaseio.com/cart/${i}.json`, true);
    xhttp.send(JSON.stringify(product));
    document.querySelector('[name="quantity"]').style.borderColor = "";
    document.querySelector('[name="quantity"]').value = "1";

  } else if(Number(product.stock) == 0) {
    document.querySelector('[name="quantity"]').style.borderColor = "red";
  } else {
    document.querySelector('[name="quantity"]').style.borderColor = "red";
  }
}

function showAdded() {
  document.querySelector("#showAdded").classList.remove("hidden")
  setTimeout(function() {
    document.querySelector("#showAdded").classList.add("hidden")
  }, 1200);
}
