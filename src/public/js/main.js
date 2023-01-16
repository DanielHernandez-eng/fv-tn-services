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

async function searchMerchantData() {
  let idtn = shopIDT.value;
  if (idtn) {
    fetch(`${apiFinvero}${idtn}`)
      .then((res) => res.json())
      .then((res) => {
        if (res != null) {
          console.log(res);
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

async function saveData() {
  let params = new URL(document.location).searchParams;
  let codeTN = params.get("code");
  let acsT, scopeD, userId;
  if (idToken.value && shopIDF.value) {
    if (codeTN) {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        token: idToken.value,
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      await fetch(
        "https://api-qa.finvero.com/api/v1/es/external/auth",
        requestOptions
      )
        .then((result) => result.json())
        .then(async (result) => {
          console.log(result);

            await fetch(
            "https://api-qa.finvero.com/api/v1/es/external/tiendanube/auth",
            {
              method: "POST",
              body: JSON.stringify({
                client_id: "5895",
                client_secret:
                  "add51cc55ef65ac36545a21c92d863dc0b9644439d41fc9a",
                code: codeTN,
                grant_type: "authorization_code",
              }),
              headers: {
                "Content-type": "application/json",
                Authorization: "Bearer " + result["token"],
              },
            }
          )
            .then((res) => res.json())
            .then((res) => {
              console.log(res);
              acsT = res["access_token"];
              scopeD = res["scope"];
              userId = res["user_id"];
            })
            .catch((error) => console.error("error", error));
        })
        .catch((error) => console.log("error", error));
    } else {
      console.warn("code instalation is empty");
    }
    insertData();
  } else {
    showAlert("Favor de llenar los campos", "danger");
  }
}

function insertData(){
  
  if (nuevo) {
    if (acsT && scopeD && userId) {
      fetch(apiFinvero, {
        method: "POST",
        body: JSON.stringify({
          shop_id: shopIDF.value,
          id_token: idToken.value,
          access_token: acsT,
          scope: scopeD,
          user_id: userId,
        }),
        headers: { "Content-type": "application/json" },
      })
        .then((res) => res.json())
        .then((res) => console.log(res))
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
        .then((res) => console.log(res))
        .catch((error) => console.error("error", error));
    } else {
      showAlert("credenciales tiendanube vacias", "danger");
    }
  } else {

    let raw2;
    console.log("esto trae access token: " + acsT);
    if (acsT) {
      raw2 = JSON.stringify({
        access_token: acsT,
        shop_id: shopIDF.value,
        id_token: idToken.value,
      });
    } else {
      raw2 = JSON.stringify({
        shop_id: shopIDF.value,
        id_token: idToken.value,
      });
    }

  console.log(raw2);
    fetch(`${apiFinvero}${shopIDT.value}`, {
      method: "PUT",
      body: raw2,
      headers: { "Content-type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => console.log(res["matchedCount"]))
      .catch((error) => console.error("error", error));
    showAlert("Registro actualizado", "success");
  }
}