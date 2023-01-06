let params = new URL(document.location).searchParams;
let codeTN = params.get("code");
let acsT, scopeD, userId;
let nuevo = false;
// let apiFinvero= "http://localhost:3000/merchants/";
let apiFinvero = "https://fv-tn-services-production.up.railway.app/merchants/";
// let baseUrl = "http://localhost:3000/";
let baseUrl = "https://fv-tn-services-production.up.railway.app/";

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
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    token:
      "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnphRzl3U1dRaU9pSTJaakUyTUdJME1DMDJPRFJsTFRRM09EWXRPVEF3WXkwMllUVmhPVGcwWm1Rek1USWlMQ0oxYzJWeVNXUWlPaUkzTldGa05XTmlZaTFpTUROa0xUUXdaakF0WVdKaU9DMDVOamhqTXpNeU5UVmtabVVpTENKeWIyeGxjeUk2V3lKVFNFOVFYMVZUUlZJaVhTd2lhV0YwSWpveE5qTTNNVEF6TkRZMUxDSmxlSEFpT2pFMk5qZzJOakV3TmpWOS5rQ3VybDBFb2N3NjZHSU5uMURUd19KUzlSNlVvMWVqQkdZS09YLUhweHRN",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://api-qa.finvero.com/api/v1/es/external/auth", requestOptions)
    .then((response) => response.text())
    .then((result) => {result.json(); console.log( result["token"])})
    .catch((error) => console.log("error", error));

} else {
  console.warn("code instalation is empty");
}

function searchMerchantData() {
  let idtn = shopIDT.value;
  if (idtn) {
    fetch(`${apiFinvero}${idtn}`)
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
        fetch(apiFinvero, {
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
            src: `${baseUrl}fv-tn-services/src/public/js/script-store-front.js`,
            event: "onfirstinteraction",
            where: "store,checkout",
          }),
          headers: {
            "Content-type": "application/json",
            Authentication: `bearer ${acsT}`,
          },
        })
          .then((res) => res.json())
          .then((res) => console.log(`${res}`))
          .catch((error) => console.error("error", error));
      } else {
        showAlert("credenciales tiendanube vacias", "danger");
      }
    } else {
      fetch(`${apiFinvero}${shopIDT.value}`, {
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
