let list = {};
let cart = {};
let idx;

function ajax(method, url, body, callback, rejectCallback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        if (typeof callback === "function") {
          callback(JSON.parse(this.responseText));
        }
      } else {
        if (typeof rejectCallback === "function") {
          rejectCallback(new Error("serverul a dat eroare"));
        }
      }
    }
  };
  xhttp.open(method, url, true);
  xhttp.send(body);
};

function getNumberOfProdInCart() {

  ajax("GET", "https://parfumerie-99bd8.firebaseio.com/cart.json", undefined, function(answer) {
    cart = answer;
    var sum = 0;
    for (var i in cart) {
      if (cart[i] === null) {
        continue
      };
      sum += Number(cart[i].quantity);
    }
    document.querySelector("#nr-of-prod-in-cart").innerHTML = "(" + sum + ")";
  })
}

function loading() {
  var load = setTimeout(showPage, 600);
}

function showPage() {
  getList();
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#productsContainer").classList.remove("hidden");
}

function getList() {
  ajax("GET", "https://parfumerie-99bd8.firebaseio.com/products.json", undefined, function(answer) {
    list = answer;
    draw();
  })
};

function draw() {
  var str = "";
  for (var i in list) {
    if (!list.hasOwnProperty(i)) {
      continue;
    }
    if (list[i] === null) {
      continue;
    }

    str += `
    <div class="col-lg-4 col-xs-12 col-sm-6 ">
      <img src="${list[i].image}" alt="parfume"/>
      <div>${list[i].name}</div>
      <div>${list[i].brand}</div>
      <div class="details">
        <div>${list[i].price} lei</div>
        <div><a href="details.html?products=${i}"><button>Detalii</button></a></div>
      </div>
    </div>
  `;
  }
  getNumberOfProdInCart();
  document.querySelector("#productsContainer").innerHTML = str;
}
