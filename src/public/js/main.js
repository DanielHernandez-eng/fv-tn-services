let params = new URL(document.location).searchParams;
let codeTN = params.get("code");
let acsT, scopeD, userId;
let nuevo = false;

let buttonSearchInfo = document.getElementById("btnLookInfo");
buttonSearchInfo.addEventListener("click", searchMerchantData);

let buttonSave = document.getElementById("btnSaveD");
buttonSave.addEventListener("click", saveData);

let idToken = document.getElementById("txtIDT");
let shopIDF = document.getElementById("txtSIDF");
let shopIDT = document.getElementById("txtSIDT");
let hidenForm = document.getElementById("hiden-form");
const alertPlaceholder = document.getElementById("liveAlertPlaceholder");


const showAlert = (message, type) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div id="content-alert" class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  const contentAlert = document.getElementById("content-alert");
  if (contentAlert) {
    // alert(contentAlert[0]);
    alertPlaceholder.removeChild(contentAlert);
  }
  alertPlaceholder.append(wrapper);
};

if (codeTN) {
  fetch("https://www.tiendanube.com/apps/authorize/token", {
    method: "POST",
    body: JSON.stringify({
      client_id: "5602",
      client_secret: "Qbu78wIK8w3z7mnZK34oG8eCBPKJRhA14RLzbDffaukI2Dgz",
      grant_type: "authorization_code",
      code: codeTN,
    }),
    headers: { "Content-type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(
        `dato 1: ${res["access_token"]}, dato 2: ${res["scope"]}, dato 3: ${res["user_id"]}`
      );
      acsT = res["access_token"];
      scopeD = res["scope"];
      userId = res["user_id"];
    });
} else {
  console.warn("code instalation is empty");
}

function searchMerchantData() {
  let idtn = shopIDT.value;
  if (idtn) {
    fetch(`http://localhost:3000/merchants/${idtn}`)
      .then((res) => res.json())
      .then((res) => {
        if (res != null) {
          console.log(
            `shop_id: ${res["shop_id"]} id_token: ${res["id_token"]}`
          );
          idToken.value = res["id_token"];
          shopIDF.value = res["shop_id"];

          //mostrar campos llenos
        } else {
          nuevo = true;
          idToken.value = "";
          shopIDF.value = "";
          //mostrar campos vacios
        }
      })
      .catch((error) => console.error("error", error));
    hidenForm.classList.remove("collapse");
  } else {
    showAlert("Shop id tiendanube vacio", "danger");
  }
}

function saveData() {
  if (idToken.value && shopIDF.value) {
    if (nuevo) {
      if (acsT && scopeD && userId) {
        fetch(`http://localhost:3000/merchants`, {
          method: "POST",
          body: JSON.stringify({
            shop_id: idToken.value,
            id_token: shopIDF.value,
            access_token: acsT,
            scope: scopeD,
            user_id: userId,
          }),
          headers: { "Content-type": "application/json" },
        })
          .then((res) => res.json())
          .then((res) => console.log(`${res}`))
          .catch((error) => console.error("error", error));
        showAlert("Registro guardado", "success");

        fetch(`https://api.tiendanube.com/v1/${userId}/scripts`, {
          method: "POST",
          body: JSON.stringify({
            src: "http://localhost:3000/fv-tn-services/src/public/js/script-store-front.js",
            event: "onfirstinteraction",
            where: "store,checkout"
          }),
          headers: { 
            "Content-type": "application/json",
            "Authentication": `bearer ${acsT}`
          },
        })
          .then((res) => res.json())
          .then((res) => console.log(`${res}`))
          .catch((error) => console.error("error", error));
      } else {
        showAlert("credenciales tiendanube vacias", "danger");
      }
    } else {
      fetch(`http://localhost:3000/merchants/${shopIDT.value}`, {
        method: "PUT",
        body: JSON.stringify({
          shop_id: shopIDF.value,
          id_token: idToken.value,
        }),
        headers: { "Content-type": "application/json" },
      })
        .then((res) => res.json())
        .then((res) => console.log(res["matchedCount"]))
        .catch((error) => console.error("error", error));
      showAlert("Registro actualizado", "success");
    }
  } else {
    showAlert("Favor de llenar los campos", "danger");
  }
}
