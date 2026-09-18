/* =========================================================
   KAELZONLINE APP.JS
   Versi bersih
   ========================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const money = n =>
  "Rp " + Number(n || 0).toLocaleString("id-ID");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[m]));

/* =========================================================
   CATALOG
   ========================================================= */

const catalog = [

  /* GAME */
  {
    id:"ff",
    category:"game",
    name:"Free Fire",
    icon:"🔥",
    description:"Top Up Diamond Free Fire",
    products:[
      {id:"ff5",name:"5 Diamond",price:1000},
      {id:"ff12",name:"12 Diamond",price:2000},
      {id:"ff50",name:"50 Diamond",price:7000},
      {id:"ff70",name:"70 Diamond",price:10000},
      {id:"ff140",name:"140 Diamond",price:19000},
      {id:"ff355",name:"355 Diamond",price:47000},
      {id:"ff720",name:"720 Diamond",price:93000}
    ]
  },

  {
    id:"ml",
    category:"game",
    name:"Mobile Legends",
    icon:"🎮",
    description:"Top Up Diamond Mobile Legends",
    products:[
      {id:"ml5",name:"5 Diamond",price:1500},
      {id:"ml12",name:"12 Diamond",price:3000},
      {id:"ml28",name:"28 Diamond",price:6000},
      {id:"ml59",name:"59 Diamond",price:12000},
      {id:"ml85",name:"85 Diamond",price:17000},
      {id:"ml170",name:"170 Diamond",price:33000},
      {id:"ml296",name:"296 Diamond",price:55000},
      {id:"ml408",name:"408 Diamond",price:75000}
    ]
  },

  /* VIRTUAL NUMBER */
  {
    id:"wa",
    category:"virtual",
    name:"Nomor Virtual WhatsApp",
    icon:"📱",
    description:"Nomor virtual untuk WhatsApp",
    products:[
      {id:"wa1",name:"Nomor WhatsApp 1x",price:10000},
      {id:"wa7",name:"Nomor WhatsApp Premium",price:25000}
    ]
  },

  {
    id:"shopee",
    category:"virtual",
    name:"Nomor Virtual Shopee",
    icon:"🛒",
    description:"Nomor virtual untuk Shopee",
    products:[
      {id:"shopee1",name:"Nomor Shopee",price:12000}
    ]
  },

  /* LOGO */
  {
    id:"logo",
    category:"logo",
    name:"Jasa Pembuatan Logo",
    icon:"🎨",
    description:"Buat logo sesuai request",
    products:[
      {
        id:"logo-basic",
        name:"Logo Basic",
        price:25000
      },
      {
        id:"logo-premium",
        name:"Logo Premium",
        price:50000
      }
    ]
  }

];

/* =========================================================
   PRODUCT HELPERS
   ========================================================= */

function getAllProducts(){
  return catalog.flatMap(c =>
    c.products.map(p => ({
      ...p,
      category:c.category,
      categoryId:c.id,
      categoryName:c.name,
      icon:c.icon
    }))
  );
}

function findProduct(id){
  return getAllProducts().find(p => p.id === id);
}

function getCategory(id){
  return catalog.find(c => c.id === id);
}

/* =========================================================
   LOCAL PRODUCT SUPPORT
   ========================================================= */

function getLocalProducts(){
  try{
    return JSON.parse(localStorage.getItem("ko_products") || "[]");
  }catch{
    return [];
  }
}

function saveProduct(product){
  const list = getLocalProducts();
  const index = list.findIndex(x => x.id === product.id);

  if(index >= 0) list[index] = product;
  else list.push(product);

  localStorage.setItem("ko_products", JSON.stringify(list));
}

function getProducts(){
  return [
    ...getAllProducts(),
    ...getLocalProducts()
  ];
}

/* =========================================================
   CART
   ========================================================= */

function getCart(){
  try{
    return JSON.parse(localStorage.getItem("ko_cart") || "null");
  }catch{
    return null;
  }
}

function setCart(product){
  localStorage.setItem("ko_cart", JSON.stringify(product));
}

function clearCart(){
  localStorage.removeItem("ko_cart");
}

/* =========================================================
   INDEXED DB
   ========================================================= */

function idbOpen(){
  return new Promise((resolve,reject)=>{
    const request = indexedDB.open("KaelzOnlineDB",1);

    request.onupgradeneeded = e =>{
      const db = e.target.result;

      if(!db.objectStoreNames.contains("files")){
        db.createObjectStore("files");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key,value){
  const db = await idbOpen();

  return new Promise((resolve,reject)=>{
    const tx = db.transaction("files","readwrite");
    tx.objectStore("files").put(value,key);

    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key){
  const db = await idbOpen();

  return new Promise((resolve,reject)=>{
    const tx = db.transaction("files","readonly");
    const req = tx.objectStore("files").get(key);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(key){
  const db = await idbOpen();

  return new Promise((resolve,reject)=>{
    const tx = db.transaction("files","readwrite");
    tx.objectStore("files").delete(key);

    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

/* =========================================================
   GLOBAL BUTTONS
   ========================================================= */

function bindGlobal(){

  $$("[data-product]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const product = findProduct(btn.dataset.product);

      if(!product) return;

      setCart(product);
      location.href = "checkout.html";
    });
  });

  $$("[data-buy]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const product = findProduct(btn.dataset.buy);

      if(!product) return;

      setCart(product);
      location.href = "checkout.html";
    });
  });

}

/* =========================================================
   HOME
   ========================================================= */

function renderHome(){

  const target = $("#homeProducts");

  if(!target) return;

  const products = getProducts();

  target.innerHTML = products.map(p=>`
    <div class="product-card">

      <div class="product-icon">
        ${esc(p.icon || "🛍️")}
      </div>

      <div class="product-info">
        <h3>${esc(p.name)}</h3>

        <p>${money(p.price)}</p>

        <button
          class="btn"
          data-buy="${esc(p.id)}">
          Beli
        </button>
      </div>

    </div>
  `).join("");

  bindGlobal();
}

/* =========================================================
   PRODUCT PAGE
   ========================================================= */

function productPage(page){

  const category =
    getCategory(page) ||
    catalog.find(c => c.category === page);

  if(!category) return;

  const target =
    $("#products") ||
    $("#productList") ||
    $("#gameProducts") ||
    $("#virtualProducts");

  if(!target) return;

  target.innerHTML = category.products.map(p=>`

    <div class="product-card">

      <div class="product-icon">
        ${esc(category.icon)}
      </div>

      <div class="product-info">

        <h3>${esc(p.name)}</h3>

        <strong>${money(p.price)}</strong>

        <button
          class="btn"
          data-buy="${esc(p.id)}">
          Beli Sekarang
        </button>

      </div>

    </div>

  `).join("");

  bindGlobal();
}

/* =========================================================
   LOGO REFERENCE
   ========================================================= */

async function logoGallery(){

  const input =
    $("#logo_reference") ||
    $("#logoReference") ||
    $("#reference");

  if(!input) return;

  input.addEventListener("change", async ()=>{

    const file = input.files?.[0];

    if(!file) return;

    if(file.size > 10 * 1024 * 1024){
      alert("Ukuran gambar maksimal 10 MB.");
      input.value = "";
      return;
    }

    await idbSet("logoReference",file);

    const preview =
      $("#logoPreview") ||
      $("#referencePreview");

    if(preview){
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }

  });

}

/* =========================================================
   CHECKOUT
   ========================================================= */

async function checkout(){

  const target = $("#checkout");

  if(!target) return;

  const cart = getCart();

  if(!cart){

    target.innerHTML = `
      <div class="empty">
        Keranjang kosong.
        <br><br>
        <a href="game.html" class="btn">
          Kembali Belanja
        </a>
      </div>
    `;

    return;
  }

  const isGame =
    cart.category === "game";

  const isML =
    cart.id?.startsWith("ml");

  const isVirtual =
    cart.category === "virtual";

  const isLogo =
    cart.category === "logo";

  target.innerHTML = `

    <div class="checkout-card">

      <h2>${esc(cart.name)}</h2>

      <div class="checkout-price">
        ${money(cart.price)}
      </div>

      <form id="checkoutForm">

        <label>Nama</label>

        <input
          name="name"
          type="text"
          placeholder="Nama kamu"
          required
        >

        ${
          isGame
          ? `
            <label>ID Game</label>

            <input
              name="game_id"
              type="text"
              placeholder="Masukkan ID Game"
              required
            >
          `
          : ""
        }

        ${
          isML
          ? `
            <label>Server</label>

            <input
              name="server"
              type="text"
              placeholder="Contoh: 1234"
              required
            >
          `
          : ""
        }

        ${
          isVirtual
          ? `
            <label>Nomor WhatsApp</label>

            <input
              name="wa"
              type="text"
              placeholder="08xxxxxxxxxx"
              required
            >
          `
          : ""
        }

        ${
          isLogo
          ? `
            <label>Nama Logo / Brand</label>

            <input
              name="logo_name"
              type="text"
              placeholder="Nama brand"
              required
            >

            <label>Deskripsi Logo</label>

            <textarea
              name="logo_description"
              placeholder="Jelaskan logo yang kamu inginkan"
              required
            ></textarea>

            <label>Referensi Logo</label>

            <input
              id="logo_reference"
              name="logo_reference"
              type="file"
              accept="image/*"
            >

            <img
              id="logoPreview"
              style="
                display:none;
                max-width:100%;
                margin-top:10px;
                border-radius:10px;
              "
            >
          `
          : ""
        }

        <label>Metode Pembayaran</label>

        <select name="payment" required>

          <option value="">
            Pilih pembayaran
          </option>

          <option value="QRIS">
            QRIS
          </option>

          <option value="DANA">
            DANA
          </option>

          <option value="OVO">
            OVO
          </option>

          <option value="GoPay">
            GoPay
          </option>

          <option value="Transfer Bank">
            Transfer Bank
          </option>

        </select>

        <label>Bukti Transfer</label>

        <input
          name="proof"
          type="file"
          accept="image/*"
          required
        >

        <button
          type="submit"
          class="btn"
          id="submitOrder">

          Pesan Sekarang

        </button>

        <div id="checkoutStatus"></div>

      </form>

    </div>

  `;

  logoGallery();

  const form = $("#checkoutForm");
  const status = $("#checkoutStatus");
  const submit = $("#submitOrder");

  form.addEventListener("submit", async e =>{

    e.preventDefault();

    if(!window.supabaseClient){

      status.innerHTML =
        `<p>Supabase belum terhubung.</p>`;

      return;
    }

    submit.disabled = true;

    status.innerHTML =
      `<p>Mengupload data...</p>`;

    try{

      const f = new FormData(form);

      const proof =
        f.get("proof");

      if(!proof || proof.size === 0){
        throw new Error("Bukti transfer wajib diupload.");
      }

      /* -----------------------------------------
         ORDER CODE
         ----------------------------------------- */

      const code =
        "KO-" +
        Date.now().toString(36).toUpperCase() +
        Math.random()
          .toString(36)
          .slice(2,6)
          .toUpperCase();

      /* -----------------------------------------
         PAYMENT PROOF
         ----------------------------------------- */

      let proofPath = null;

      const proofExt =
        proof.name.split(".").pop() || "jpg";

      proofPath =
        `${code}/payment.${proofExt}`;

      const uploadProof =
        await window.supabaseClient
          .storage
          .from("payment-proofs")
          .upload(
            proofPath,
            proof,
            {
              upsert:true,
              contentType:proof.type
            }
          );

      if(uploadProof.error){
        throw new Error(
          "Upload bukti transfer gagal: " +
          uploadProof.error.message
        );
      }

      /* -----------------------------------------
         LOGO REFERENCE
         ----------------------------------------- */

      let referencePath = null;

      if(isLogo){

        const reference =
          await idbGet("logoReference");

        if(reference){

          const ext =
            reference.name?.split(".").pop() || "jpg";

          referencePath =
            `${code}/reference.${ext}`;

          const uploadReference =
            await window.supabaseClient
              .storage
              .from("logo-references")
              .upload(
                referencePath,
                reference,
                {
                  upsert:true,
                  contentType:
                    reference.type ||
                    "image/jpeg"
                }
              );

          if(uploadReference.error){

            throw new Error(
              "Upload referensi logo gagal: " +
              uploadReference.error.message
            );

          }

        }

      }

      /* -----------------------------------------
         DETAIL
         ----------------------------------------- */

      const detail = {

        buyer_name:
          f.get("name") || null,

        game_id:
          isGame
            ? f.get("game_id")
            : null,

        game_server:
          isML
            ? f.get("server")
            : null,

        whatsapp:
          isVirtual
            ? f.get("wa")
            : null,

        logo_name:
          isLogo
            ? f.get("logo_name")
            : null,

        logo_description:
          isLogo
            ? f.get("logo_description")
            : null

      };

      /* -----------------------------------------
         ORDER PAYLOAD
         ----------------------------------------- */

      const orderPayload = {

        order_code: code,

        product_id: cart.id,

        product_name: cart.name,

        buyer_name:
          f.get("name") || null,

        whatsapp:
          isVirtual
            ? f.get("wa")
            : null,

        detail: JSON.stringify(detail),

        payment_method:
          f.get("payment"),

        amount:
          cart.price,

        status:
          "Menunggu Verifikasi",

        proof_path:
          proofPath,

        category:
          cart.category,

        logo_reference_path:
          referencePath,

        game_id:
          isGame
            ? f.get("game_id")
            : null,

        game_server:
          isML
            ? f.get("server")
            : null,

        logo_request_name:
          isLogo
            ? f.get("logo_name")
            : null,

        logo_description:
          isLogo
            ? f.get("logo_description")
            : null

      };

      /* -----------------------------------------
         INSERT ORDER
         IMPORTANT:
         Tidak menggunakan .select().single()
         ----------------------------------------- */

      const result =
        await window.supabaseClient
          .from("orders")
          .insert(orderPayload);

      if(result.error){

        /* hapus bukti jika order gagal */

        await window.supabaseClient
          .storage
          .from("payment-proofs")
          .remove([proofPath]);

        if(referencePath){

          await window.supabaseClient
            .storage
            .from("logo-references")
            .remove([referencePath]);

        }

        throw new Error(
          result.error.message
        );
      }

      /* -----------------------------------------
         BERHASIL
         ----------------------------------------- */

      await idbDelete("logoReference");

      localStorage.setItem(
        "ko_last_order_id",
        code
      );

      clearCart();

      status.innerHTML = `
        <p>
          Pesanan berhasil dibuat.
          Mengalihkan...
        </p>
      `;

      setTimeout(()=>{
        location.href = "orders.html";
      },700);

    }catch(err){

      console.error(
        "CHECKOUT ERROR:",
        err
      );

      status.innerHTML = `
        <p style="color:red">
          Pesanan gagal: ${esc(err.message)}
        </p>
      `;

      submit.disabled = false;

    }

  });

}

/* =========================================================
   ORDERS
   ========================================================= */

async function orders(){

  const target =
    $("#orders") ||
    $("#orderList");

  if(!target) return;

  if(!window.supabaseClient){

    target.innerHTML =
      `<div class="empty">Supabase belum terhubung.</div>`;

    return;
  }

  target.innerHTML =
    `<div class="empty">Memuat pesanan...</div>`;

  try{

    const result =
      await window.supabaseClient
        .from("orders")
        .select("*")
        .order(
          "created_at",
          {ascending:false}
        )
        .limit(50);

    if(result.error){

      target.innerHTML = `
        <div class="empty">
          Gagal memuat pesanan.
          <br>
          ${esc(result.error.message)}
        </div>
      `;

      return;
    }

    const data =
      result.data || [];

    if(!data.length){

      target.innerHTML =
        `<div class="empty">Belum ada pesanan.</div>`;

      return;
    }

    target.innerHTML =
      data.map(order=>`

        <div class="order-card">

          <div>
            <strong>
              ${esc(order.product_name || "Pesanan")}
            </strong>

            <div>
              ${esc(order.order_code || "")}
            </div>
          </div>

          <div>
            ${money(order.amount)}
          </div>

          <div>
            Status:
            <strong>
              ${esc(
                order.status ||
                "Menunggu Verifikasi"
              )}
            </strong>
          </div>

          ${
            order.proof_path
            ? `
              <div>
                Bukti transfer:
                <span>Terupload</span>
              </div>
            `
            : ""
          }

        </div>

      `).join("");

  }catch(err){

    console.error(
      "ORDERS ERROR:",
      err
    );

    target.innerHTML = `
      <div class="empty">
        ${esc(err.message)}
      </div>
    `;

  }
}


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  ()=>{

    bindGlobal();

    renderHome();

    logoGallery();

    const page =
      document.body.dataset.page;

    if(
      page === "game" ||
      page === "virtual" ||
      page === "logo"
    ){

      productPage(page);

    }

    if(page === "checkout"){

      checkout();

    }

    if(page === "orders"){

      orders();

    }

  }
);