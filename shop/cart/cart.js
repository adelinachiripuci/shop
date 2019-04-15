var list = {};
var insufficientStock = [];
var products = {};
var err = "S-a produs o eroare."


async function ajax(method, url, body) {
  return new Promise(function(resolve, reject) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(JSON.parse(this.responseText));
        } else {
          reject(new Error("serverul a dat eroare"));
        }
      }
    };
    xhttp.open(method, url, true);
    xhttp.send(body);
  });
};

async function getCart() {
  await ajax("GET", "https://parfumerie-99bd8.firebaseio.com/cart.json")
    .then(async function(answer) {
      window.list = answer;
      if (list == undefined) {
        drawEmptyCart();
        await getNumberOfProdInCart();
      } else {
        await draw();
        subtotal();
        calculateCosts();
        document.querySelector("#orderCosts").classList.remove("hidden");

      }
    })
    .catch(function(err) {
      console.error(err);
    })
};

function drawEmptyCart() {
  document.querySelector("#content").innerHTML = "Nu aveti niciun produs adaugat.";
  document.querySelector("#content").classList.add("emptyCart");
};

function drawOrderMade() {
  document.querySelector("#content").innerHTML = "Comanda a fost efectuata cu succes.";
  document.querySelector("#content").classList.add("orderMade");
};

async function draw() {
  var str = "";
  for (var i in list) {
    if (!list.hasOwnProperty(i)) {
      continue;
    }
    if (list[i] === null) {
      continue;
    }

    str += `
    <div class="row">
      <div class="image col-lg-3 col-sm-4 col-xs-4">
        <img src="${list[i].image}" alt="parfume"/>
      </div>
      <div class="name col-lg-2 col-sm-4 col-xs-5">
        <a target="_blank" id="${i}" href="../firstPage/details.html?products=${i}" >
          ${list[i].name}
        </a>
      </div>
      <div class="col-lg-1 col-sm-4 col-xs-3 price">
        ${list[i].price}<span>lei</span>
      </div>
      <div class="col-lg-1 col-sm-2 col-xs-1 " style="text-align:right; cursor:pointer;"  onclick="decrease('${i}')">
       -
      </div>
      <div class="quantity col-lg-1 col-sm-3 col-xs-2 " >
        <div id=" ${list[i].name}">  ${list[i].quantity}</div>
      </div>
      <div class="col-lg-1 col-sm-2 col-xs-1 " style="text-align:left; cursor:pointer;" onclick="increase('${i}')">
       +
      </div>
      <div class="col-lg-1 col-sm-2 col-xs-2">Subtotal:</div>
      <div class="subtotal col-lg-1 col-sm-2 col-xs-2 ${i}" ></div>
      <div onclick="deleteItem('${i}')" style="cursor:pointer;" class="col-lg-1 col-sm-2 col-xs-3 delete ">
      Sterge
      </div>
    </div>
    <hr>
    `;

  }
  await getNumberOfProdInCart()
  document.querySelector("#products").innerHTML = str;
};

async function increase(i) {
  if (list[i].stock > list[i].quantity) {
    var el = Number(list[i].quantity);
    el += 1;
    await ajax("PUT", `https://parfumerie-99bd8.firebaseio.com/cart/${i}/quantity.json`, JSON.stringify(el))
    await getCart();
    await getNumberOfProdInCart();
  } else {
    event.preventDefault();
  }
};

async function decrease(i) {
  if (Number(list[i].quantity) === 1) {
    deleteItem(i);
  } else {
    var el = Number(list[i].quantity);
    el -= 1;
    await ajax("PUT", `https://parfumerie-99bd8.firebaseio.com/cart/${i}/quantity.json`, JSON.stringify(el))
    await getCart();
  }
  await getNumberOfProdInCart()
};

function subtotal() {
  var quantity;
  var price;
  for (var i in list) {
    if (list[i] === null) {
      continue
    };
    quantity = Number(list[i].quantity);
    price = list[i].price;
    document.getElementsByClassName(i)[0].innerHTML = quantity * price
  }
};

function calculateCosts() {
  var productsCosts = document.querySelectorAll(".subtotal");
  var totalProductsCost = 0;
  var deliveryCosts = document.querySelector("#deliveryCosts");
  var totalCosts = document.querySelector("#totalCosts");
  var difference = 0;

  for (var j = 0; j < productsCosts.length; j++) {
    totalProductsCost += Number(productsCosts[j].innerHTML);
    document.querySelector("#totalProductsCost").innerHTML = totalProductsCost;
  }
  if (totalProductsCost < 1000) {
    deliveryCosts.innerHTML = 15 + " ";
    difference = 1000 - totalProductsCost;
    document.querySelector("#deliveryMessaje").style.display = "";
  } else {
    deliveryCosts.innerHTML = 0 + " ";
    document.querySelector("#deliveryMessaje").style.display = "none";
  }
  totalCosts.innerHTML = totalProductsCost + Number(deliveryCosts.innerHTML);
  document.querySelector("#deliveryMessaje").innerHTML = `*Transport
  gratuit la comenzi de peste 1000 lei.
  Mai aveti nevoie de produse in valoare de ${difference} lei.`;
};

async function deleteItem(i) {
  await ajax("DELETE", `https://parfumerie-99bd8.firebaseio.com/cart/${i}.json`)
    .then(async function(answer) {
      list = answer;
    })
  await getCart();
  await getNumberOfProdInCart();
};

function loading() {
  var load = setTimeout(showPage, 600);
};

async function getNumberOfProdInCart() {
  await ajax("GET", "https://parfumerie-99bd8.firebaseio.com/cart.json")
    .then(function(answer) {
      cart = answer;
      var sum = 0;
      for (var i in cart) {
        if (cart[i] === null) {
          continue;
        };
        sum += Number(cart[i].quantity);
      }
      document.querySelector("#nr-of-prod-in-cart").innerHTML = "(" + sum + ")";
    })
};

async function showPage() {
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").classList.remove("hidden");
  document.querySelector("#products").classList.remove("hidden");
  await getCart();

};



async function changeStock() {
  await ajax("GET", "https://parfumerie-99bd8.firebaseio.com/products.json")
    .then(function(answer) {
      window.products = answer;
    })

  for (var i in products) {
    if (list[i] === null || list[i] === undefined) {
      continue;
    }
    let stock = list[i].stock;
    let nrOfProd = list[i].quantity;
    if (products[i].name == list[i].name) {
      stock -= nrOfProd;
      await ajax("PUT", `https://parfumerie-99bd8.firebaseio.com/products/${i}/stock.json`, JSON.stringify(stock), undefined)
    }
  }
}

async function order() {
  for (var i in list) {
    if (list[i] == null) {
      continue;
    };
    if (Number(list[i].quantity) > Number(list[i].stock)) {
      if (insufficientStock.indexOf(i) == -1) {
        insufficientStock.push(i);
        document.getElementById(i).style.color = "red";
      } else {
        document.getElementById(i).style.color = "red";
      }
    } else if (Number(list[i].quantity) == Number(list[i].stock)) {
      var index = insufficientStock.indexOf(i);
      if (index !== -1) {
        insufficientStock.splice(index, 1);
      };
    } else {
      var index = insufficientStock.indexOf(i);
      if (index !== -1) {
        insufficientStock.splice(index, 1);
      };

    }
  }
  if (insufficientStock.length == 0) {
    await changeStock();
    await ajax("DELETE", `https://parfumerie-99bd8.firebaseio.com/cart.json`)
    await drawOrderMade();
    await getNumberOfProdInCart();
    document.querySelector("#unavailable").classList.add("hidden");
  } else {
    document.querySelector("#unavailable").classList.remove("hidden");
  }
}
