const loadScript = function (url, callback) {
  let script = document.createElement("script");
  script.type = "text/javascript";
  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = function () {
      callback();
    };
  }
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

var myAppJavaScript = function ($) {
  /* Your app's JavaScript here.
		 $ in this scope references the jQuery object we'll use.
		 Don't use 'jQuery', or 'jQuery191', here. Use the dollar sign
		 that was passed as argument.*/

  let prodPage = document.querySelector(".product-form-container");
  let cartPage = document.querySelector(".summary-details");
  let storeID = LS.store.id;
  // let ApiApp = `http://localhost:3000/merchants/${storeID}`;
  let ApiApp = `https://fv-tn-services-production.up.railway.app/merchants/${storeID}`;
  let ApiFinvero ="https://api-qa.finvero.com/api/v1/es/external";

  if (prodPage != null) {
    let productId = LS.product.id;
    let creditF;

    fetch(ApiApp)
      .then((res) => res.json())
      .then((res) => {
        console.log(`access token: ${res["access_token"]}`);
        fetch(
          `https://api.tiendanube.com/v1/${storeID}/products/${productId}`,
          {
            method: "GET",
            headers: { 
              Authentication: `bearer ${res["access_token"]}`, 
              "User-Agent" : "Appprueba5 (daniel.hernandez@finvero.com)" 
            },
          }
        )
          .then((res) => res.json())
          .then((res) => {
            console.log(`${res["variants"][0]["price"]}`);
            creditF = res["variants"][0]["price"] / 4;
          })
          .catch((error) => console.error("error", error));
      })
      .catch((error) => console.error("error", error));

    $(".product-form-container").append(
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter&family=Poppins:wght@700&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://azrfvrstorageresources.z13.web.core.windows.net/tiendanube/styles.css"><div  id="fv-p-container"><div id="fv-p-img"><img src="https://azrfvrstorageresources.z13.web.core.windows.net/tiendanube/finvero.jpg"/></div><div id="fv-p-line"></div><div id="fv-p-text"><div id="fv-p-text1-blue"> Llévatelo <div id="fv-p-text1-black">por</div> </div><div id="fv-p-text2">$' +
        creditF +
        ' MXN</div> <div id="fv-p-text3">Quincenales</div></div></div><br>'
    );
  }

  if (cartPage != null) {

    let minCreditF, maxCreditF;
    
    fetch(ApiApp)
      .then((res) => res.json())
      .then((res) => {
        console.log(`id token: ${res["id_token"]}`);
        fetch(`${ApiFinvero}/auth`, {
          method: "POST",
          body: { token: res["id_token"] },
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res["token"]);
            fetch(
              `${ApiFinvero}/external/credit/credit-range-amount`,
              {
                method: "GET",
                headers: { Authorization: `bearer ${res["token"]}` },
              }
            )
              .then((res) => res.json())
              .then((res) => {
                console.log(res);
                minCreditF = res["minCreditRequestAmount"];
                maxCreditF = res["maxCreditRequestAmount"];
              })
              .catch((error) => console.error("error", error));
          })
          .catch((error) => console.error("error", error));
      })
      .catch((error) => console.error("error", error));
    $(".summary-details").append(
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter&family=Poppins:wght@700&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://azrfvrstorageresources.z13.web.core.windows.net/tiendanube/styles.css"><div id="fv-c-container"><div id="fv-c-top"><div id="fv-c-img"><img src="https://azrfvrstorageresources.z13.web.core.windows.net/tiendanube/finvero.jpg" width="90px" heigth="90px"/></div><div id="fv-c-text1"><div class="fv-c-text1-bold">Paga</div> tu pedido <div class="fv-c-text1-bold">a crédito</div></div></div><div id="fv-c-line"></div><div id="fv-c-bottom"><div id="fv-c-text2">Te prestamos desde</div><div id="fv-c-text3"><div class="fv-c-amount">$' +
        minCreditF +
        '</div>hasta<div class="fv-c-amount">$' +
        maxCreditF +
        "</div></div></div></div>"
    );
  }
};

// For jQuery version 1.7
var target = [1, 7, 0];

var current =
  typeof jQuery === "undefined"
    ? [0, 0, 0]
    : $.fn.jquery.split(".").map(function (item) {
        return parseInt(item);
      });

if (
  current[0] < target[0] ||
  (current[0] == target[0] && current[1] < target[1])
) {
  loadScript(
    "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",
    function () {
      let jQuery360 = jQuery.noConflict(true);
      myAppJavaScript(jQuery360);
    }
  );
} else {
  myAppJavaScript(jQuery);
}