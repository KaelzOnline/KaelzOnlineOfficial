const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const money = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
const esc = s => String(s ?? "").replace(/[&<>"']/g,m=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#039;"
}[m]));

const catalog = [
  ["game","FREE FIRE","50 DIAMOND",8000,"💎",1],
  ["game","FREE FIRE","140 DIAMOND",18000,"💎",2],
  ["game","FREE FIRE","210 DIAMOND",27000,"💎",3],
  ["game","FREE FIRE","355 DIAMOND",44000,"💎",4],
  ["game","FREE FIRE","500 DIAMOND",61000,"💎",5],
  ["game","FREE FIRE","720 DIAMOND",85000,"💎",6],
  ["game","FREE FIRE","1450 DIAMOND",170000,"💎",7],

  ["game","MOBILE LEGENDS","56 DIAMOND",17000,"💎",8],
  ["game","MOBILE LEGENDS","144 DIAMOND",39000,"💎",9],
  ["game","MOBILE LEGENDS","240 DIAMOND",65000,"💎",10],
  ["game","MOBILE LEGENDS","355 DIAMOND",90000,"💎",11],
  ["game","MOBILE LEGENDS","460 DIAMOND",117000,"💎",12],
  ["game","MOBILE LEGENDS","712 DIAMOND",179000,"💎",13],
  ["game","MOBILE LEGENDS","1159 DIAMOND",289000,"💎",14],

  ["game","LAINNYA","LAINNYA DALAM PROSES",0,"🎮",99],

  ["virtual","WHATSAPP","INDONESIA",4000,"🇮🇩",1],
  ["virtual","WHATSAPP","COLOMBIA",6000,"🇨🇴",2],
  ["virtual","WHATSAPP","MALAYSIA",10000,"🇲🇾",3],
  ["virtual","WHATSAPP","PHILIPINA",7000,"🇵🇭",4],

  ["virtual","SHOPEE","INDONESIA",3000,"🇮🇩",5],
  ["virtual","SHOPEE","PHILIPINA",4000,"🇵🇭",6],
  ["virtual","SHOPEE","MALAYSIA",5000,"🇲🇾",7],

  ["logo","JASA LOGO","LOGO JB",1000,"🎨",1],
  ["logo","JASA LOGO","LOGO FT",3000,"🖼️",2],
  ["logo","JASA LOGO","LOGO ANIME",2000,"🌌",3],
  ["logo","JASA LOGO","LOGO CHIBI",2000,"✨",4],
  ["logo","JASA LOGO","LOGO QRIS",3000,"▣",5],
  ["logo","JASA LOGO","LOGO MUKA",5000,"👤",6],
  ["logo","JASA LOGO","LOGO TESTIMONI",3000,"💬",7],
  ["logo","JASA LOGO","LOGO WALPAPER",1000,"📱",8],
  ["logo","JASA LOGO","LOGO INFO SELL",5000,"🛍️",9]
];

function localProducts(category){
  return catalog
    .filter(x=>x[0]===category)
    .map((x,i)=>({
      id:"local-"+category+"-"+i,
      category:x[0],
      subcategory:x[1],
      name:x[2],
      price:x[3],
      icon:x[4],
      active:true,
      sort_order:x[5]
    }));
}

async function dbProducts(category){
  if(!window.supabaseClient) return localProducts(category);

  try{
    const {
      data,
      error
    } = await window.supabaseClient
      .from("products")
      .select("*")
      .eq("category",category)
      .eq("active",true)
      .order("sort_order");

    if(error || !data?.length){
      return localProducts(category);
    }

    return data;
  }catch(e){
    console.warn(e);
    return localProducts(category);
  }
}

function card(p){
  return `
    <article class="product">
      <div class="product-top">
        <div class="game-art">${esc(p.icon||"🎮")}</div>
        <div>
          <h3>${esc(p.name)}</h3>
          <small>${esc(p.subcategory||"Digital Service")}</small>
        </div>
      </div>

      <div class="row">
        <b class="price">${money(p.price)}</b>
        <button class="cta small choose" data-id="${esc(p.id)}">
          Pilih
        </button>
      </div>
    </article>
  `;
}

function saveProduct(p){
  localStorage.setItem("ko_cart",JSON.stringify(p));
  location.href="checkout.html";
}

async function productPage(category){
  const target=$("#products");
  if(!target) return;

  const tabs=$$(".tab");
  const search=$("#search");

  let all=await dbProducts(category);
  let filter=tabs[0]?.dataset.filter||"ALL";

  const draw=()=>{
    const q=(search?.value||"").toLowerCase().trim();

    const list=all.filter(p=>
      (filter==="ALL" ||
       String(p.subcategory).toUpperCase()===filter) &&
      (`${p.name} ${p.subcategory}`)
        .toLowerCase()
        .includes(q)
    );

    target.innerHTML=list.length
      ? list.map(card).join("")
      : `<div class="empty">Produk tidak ditemukan.</div>`;

    $$(".choose",target).forEach(b=>{
      b.onclick=()=>{
        const p=all.find(
          x=>String(x.id)===String(b.dataset.id)
        );

        if(p) saveProduct(p);
      };
    });
  };

  tabs.forEach(t=>{
    t.onclick=()=>{
      tabs.forEach(x=>x.classList.remove("active"));
      t.classList.add("active");
      filter=t.dataset.filter||"ALL";
      draw();
    };
  });

  search?.addEventListener("input",draw);

  draw();
}

function bindGlobal(){
  $$(".year").forEach(
    x=>x.textContent=new Date().getFullYear()
  );
}

function renderHome(){
  const fav=$("#favorites");
  if(!fav) return;

  const items=localProducts("game")
    .filter(p=>[
      "FREE FIRE",
      "MOBILE LEGENDS"
    ].includes(p.subcategory));

  fav.innerHTML=items.map(p=>`
    <a class="game-card" href="game.html">
      <div class="game-art">${p.icon}</div>
      <div>
        <b>${p.subcategory}</b>
        <small>Top Up Diamond</small>
      </div>
      <span class="arrow">›</span>
    </a>
  `).join("");
}

function idbOpen(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open("kaelzUploads",1);

    r.onupgradeneeded=()=>{
      if(!r.result.objectStoreNames.contains("pending")){
        r.result.createObjectStore("pending");
      }
    };

    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  });
}

async function idbSet(key,value){
  const db=await idbOpen();

  return new Promise((resolve,reject)=>{
    const tx=db.transaction("pending","readwrite");

    tx.objectStore("pending").put(value,key);

    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}

async function idbGet(key){
  const db=await idbOpen();

  return new Promise((resolve,reject)=>{
    const tx=db.transaction("pending","readonly");
    const r=tx.objectStore("pending").get(key);

    r.onsuccess=()=>resolve(r.result||null);
    r.onerror=()=>reject(r.error);
  });
}

async function idbDelete(key){
  const db=await idbOpen();

  return new Promise((resolve,reject)=>{
    const tx=db.transaction("pending","readwrite");

    tx.objectStore("pending").delete(key);

    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}

function logoGallery(){
  const open=$("#logoGalleryOpen");
  if(!open)return;

  open.onclick=()=>{
    const w=document.createElement("div");
    w.className="gallery-modal";

    w.innerHTML=`
      <div class="gallery-modal-backdrop"></div>
      <div class="gallery-modal-card logo-zoom-card">
        <button class="gallery-close" type="button">×</button>
        <div class="zoom-hint">
          Cubit/zoom gambar untuk melihat detail logo
        </div>
        <img
          src="logo-gallery.jpg"
          alt="Katalog contoh logo diperbesar"
        >
        <p>
          Pilih referensi yang kamu suka dari katalog.
          <b>
            Zoom logo → screenshot bagian logo → upload screenshot
            di menu referensi.
          </b>
        </p>
      </div>
    `;

    document.body.appendChild(w);

    w.querySelector(".gallery-close").onclick=()=>w.remove();
    w.querySelector(".gallery-modal-backdrop").onclick=()=>w.remove();
  };
}

async function logoReferenceFlow(){
  const chooser=$("#logoProductChooser");
  const panel=$("#logoReferencePanel");
  const input=$("#logoReferenceFile");
  const preview=$("#logoReferencePreview");
  const status=$("#logoReferenceStatus");
  const cont=$("#continueLogoCheckout");

  if(!chooser || !panel)return;

  let products=await dbProducts("logo");

  const draw=()=>{
    chooser.innerHTML=products.map(p=>`
      <article
        class="product logo-choice"
        data-id="${esc(p.id)}"
      >
        <div class="product-top">
          <div class="game-art">
            ${esc(p.icon||"🎨")}
          </div>

          <div>
            <h3>${esc(p.name)}</h3>
            <small>
              ${esc(p.subcategory||"JASA LOGO")}
            </small>
          </div>
        </div>

        <div class="row">
          <b class="price">${money(p.price)}</b>

          <button
            class="cta small"
            data-logo-id="${esc(p.id)}"
          >
            Pilih Logo
          </button>
        </div>
      </article>
    `).join("");

    chooser
      .querySelectorAll("[data-logo-id]")
      .forEach(b=>{
        b.onclick=async()=>{
          const p=products.find(
            x=>String(x.id)===String(b.dataset.logoId)
          );

          if(!p)return;

          localStorage.setItem(
            "ko_cart",
            JSON.stringify(p)
          );

          panel.hidden=false;

          status.textContent=
            "Belum ada screenshot referensi.";

          preview.innerHTML="";
          cont.disabled=true;

          window.scrollTo({
            top:panel.offsetTop-16,
            behavior:"smooth"
          });
        };
      });
  };

  draw();

  input?.addEventListener("change",async e=>{
    const f=e.target.files?.[0];

    if(!f)return;

    if(!/^image\/(jpeg|png|webp)$/.test(f.type)){
      alert(
        "Referensi harus JPG, PNG, atau WEBP."
      );

      input.value="";
      return;
    }

    if(f.size>5*1024*1024){
      alert(
        "Screenshot maksimal 5 MB."
      );

      input.value="";
      return;
    }

    try{
      await idbSet("logoReference",f);

      status.textContent=
        `Referensi siap: ${f.name}`;

      preview.innerHTML="";

      const img=document.createElement("img");

      img.src=URL.createObjectURL(f);
      img.alt="Preview screenshot referensi";

      preview.appendChild(img);

      cont.disabled=false;

    }catch(err){
      alert(
        "Referensi gagal disimpan: "+
        err.message
      );
    }
  });

  cont?.addEventListener("click",()=>{
    if(!localStorage.getItem("ko_cart")){
      return alert(
        "Pilih produk logo terlebih dahulu."
      );
    }

    location.href="checkout.html";
  });
}


/* =========================
   CHECKOUT
========================= */

async function checkout(){
  const cart=JSON.parse(
    localStorage.getItem("ko_cart")||"null"
  );

  const box=$("#checkout");

  if(!box)return;

  if(!cart){
    box.innerHTML=`
      <div class="empty">
        Belum ada produk dipilih.
        <br><br>
        <a class="cta" href="game.html">
          Pilih Produk
        </a>
      </div>
    `;

    return;
  }

  const isGame=
    cart.category==="game";

  const isML=
    String(cart.subcategory).toUpperCase()==="MOBILE LEGENDS";

  const isVirtual=
    cart.category==="virtual";

  const isLogo=
    cart.category==="logo";

  let fields="";

  if(isGame){
    fields=`
      <div class="field">
        <label>ID Game *</label>
        <input
          name="game_id"
          required
          placeholder="Masukkan ID game"
        >
      </div>

      ${
        isML
        ? `
          <div class="field">
            <label>Server *</label>
            <input
              name="server"
              required
              inputmode="numeric"
              placeholder="Masukkan server Mobile Legends"
            >
          </div>
        `
        : ""
      }
    `;
  }

  if(isVirtual){
    fields=`
      <div class="field">
        <label>Nomor WhatsApp *</label>
        <input
          name="wa"
          required
          inputmode="tel"
          placeholder="08xxxxxxxxxx"
        >
      </div>

      <div class="notice">
        Nomor WhatsApp dipakai untuk pengiriman OTP
        saat nomor virtual sudah aktif.
      </div>
    `;
  }

  let logoRef=null;

  if(isLogo){
    logoRef=await idbGet("logoReference");

    if(!logoRef){
      box.innerHTML=`
        <div class="empty">
          Referensi logo belum dipilih.
          <br><br>
          <a class="cta" href="logo.html">
            Pilih Referensi Logo Dulu
          </a>
        </div>
      `;

      return;
    }

    fields=`
      <div class="logo-reference-confirm">
        <div class="section-title">
          <h3>Referensi Logo</h3>
          <a class="text-link" href="logo.html">
            Ganti
          </a>
        </div>

        <div class="upload-preview">
          <img
            src="${URL.createObjectURL(logoRef)}"
            alt="Referensi logo"
          >
        </div>

        <small class="muted">
          Referensi sudah dipilih sebelum pembayaran.
          Pastikan screenshot memperlihatkan logo
          yang kamu inginkan.
        </small>
      </div>

      <div class="field">
        <label>REQUEST NAMA *</label>
        <input
          name="logo_name"
          required
          placeholder="Nama yang ingin dibuat"
        >
      </div>

      <div class="field">
        <label>DESKRIPSI LAINNYA *</label>
        <textarea
          name="logo_description"
          required
          placeholder="Jelaskan logo yang kamu inginkan"
        ></textarea>
      </div>
    `;
  }

  box.innerHTML=`
    <div class="checkout-grid">

      <section class="panel">
        <h2 style="margin-top:0">
          Detail Pesanan
        </h2>

        <div
          class="product"
          style="margin-bottom:14px"
        >
          <div class="row">
            <div>
              <b>${esc(cart.name)}</b>
              <div class="muted">
                ${esc(cart.subcategory)}
              </div>
            </div>

            <b class="price">
              ${money(cart.price)}
            </b>
          </div>
        </div>

        <form id="orderForm" class="form">

          ${fields}

          <div class="field">
            <label>Metode Pembayaran *</label>

            <select
              name="payment"
              id="payment"
              required
            >
              <option value="">
                Pilih pembayaran
              </option>
              <option>QRIS</option>
              <option>DANA</option>
              <option>OVO</option>
              <option>GoPay</option>
              <option>Transfer Bank</option>
            </select>
          </div>

          <div
            id="qrisBox"
            class="panel qris"
            style="display:none"
          >
            <b>Scan QRIS untuk Pembayaran</b>

            <img
              src="qris.jpg"
              alt="QRIS"
            >

            <small class="muted">
              Setelah membayar,
              upload bukti transfer asli.
            </small>
          </div>

          <div class="field">
            <label>
              Upload Bukti Transfer *
            </label>

            <input
              name="proof"
              id="proof"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              required
              capture="environment"
            >

            <small class="muted">
              JPG, PNG, WEBP, PDF —
              maksimal 5 MB.
              File disimpan apa adanya.
            </small>
          </div>

          <button
            class="cta"
            id="submitOrder"
            type="submit"
          >
            Bayar & Buat Pesanan →
          </button>

        </form>
      </section>

      <aside class="panel">
        <h3>Ringkasan</h3>

        <div class="order-row">
          <span>Produk</span>
          <b>${esc(cart.name)}</b>
        </div>

        <div class="order-row">
          <span>Total</span>
          <b class="price">
            ${money(cart.price)}
          </b>
        </div>

        <div class="notice">
          ${
            isLogo
            ? "Referensi logo sudah dipilih. Setelah ini lakukan pembayaran lalu upload bukti transfer."
            : "Setelah pembayaran, pesanan masuk ke admin untuk diverifikasi."
          }
        </div>
      </aside>

    </div>
  `;

  $("#payment").onchange=e=>{
    $("#qrisBox").style.display=
      e.target.value==="QRIS"
      ? "block"
      : "none";
  };

  $("#orderForm").onsubmit=async e=>{
    e.preventDefault();

    const btn=$("#submitOrder");
    const f=new FormData(e.target);
    const proof=f.get("proof");

    if(!proof?.size){
      alert("Bukti transfer wajib diupload.");
      return;
    }

    if(proof.size>5*1024*1024){
      alert("Ukuran bukti maksimal 5 MB.");
      return;
    }

    btn.disabled=true;
    btn.textContent="Mengirim...";

    let proofPath=null;
    let referencePath=null;

    try{
      if(!window.supabaseClient){
        throw new Error(
          "Supabase belum terhubung."
        );
      }

      const code=
        "KO-"+
        Date.now()
          .toString(36)
          .toUpperCase();

      const safe=proof.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      proofPath=
        `${code}/${crypto.randomUUID()}-${safe}`;

      /* Upload bukti pembayaran */
      let up=
        await window.supabaseClient
          .storage
          .from("payment-proofs")
          .upload(
            proofPath,
            proof,
            {
              contentType:proof.type,
              upsert:false
            }
          );

      if(up.error){
        throw up.error;
      }

      /* Upload referensi logo jika produk logo */
      if(isLogo){
        const safeRef=
          logoRef.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

        referencePath=
          `${code}/${crypto.randomUUID()}-${safeRef}`;

        up=
          await window.supabaseClient
            .storage
            .from("logo-references")
            .upload(
              referencePath,
              logoRef,
              {
                contentType:logoRef.type,
                upsert:false
              }
            );

        if(up.error){
          await window.supabaseClient
            .storage
            .from("payment-proofs")
            .remove([proofPath]);

          proofPath=null;

          throw up.error;
        }
      }

      /* Detail pesanan */
      let detail="";

      if(isGame){
        detail=
          `ID Game: ${f.get("game_id")}`;

        if(isML){
          detail+=
            ` | Server: ${f.get("server")}`;
        }
      }

      if(isLogo){
        detail=
          `REQUEST NAMA: ${f.get("logo_name")} | `+
          `DESKRIPSI LAINNYA: ${f.get("logo_description")}`;
      }

      if(isVirtual){
        detail=
          "Nomor virtual diproses admin; OTP dikirim setelah nomor aktif.";
      }

      /*
       * PENTING:
       * Jangan gunakan .select().single()
       * setelah INSERT.
       *
       * Karena user anonim tidak memiliki
       * izin SELECT pada tabel orders.
       */
      const orderPayload={
        order_code:code,
        product_id:cart.id,
        product_name:cart.name,

        buyer_name:
          isLogo
          ? f.get("logo_name")
          : isGame
            ? f.get("game_id")
            : null,

        whatsapp:
          isVirtual
          ? f.get("wa")
          : null,

        detail:detail,

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

      const {error:orderError}=
        await window.supabaseClient
          .from("orders")
          .insert(orderPayload);

      if(orderError){

        /* Hapus file jika pembuatan order gagal */
        if(proofPath){
          await window.supabaseClient
            .storage
            .from("payment-proofs")
            .remove([proofPath]);
        }

        if(referencePath){
          await window.supabaseClient
            .storage
            .from("logo-references")
            .remove([referencePath]);
        }

        throw orderError;
      }

      /* Order berhasil */
      if(isLogo){
        await idbDelete(
          "logoReference"
        );
      }

      localStorage.removeItem(
        "ko_cart"
      );

      /*
       * Tidak memakai data.id karena
       * INSERT tidak melakukan SELECT.
       */
      localStorage.setItem(
        "ko_last_order_id",
        code
      );

      location.href="orders.html";

    }catch(err){

      console.error(
        "CHECKOUT ERROR:",
        err
      );

      alert(
        "Pesanan gagal: "+
        (err?.message || String(err))
      );

      btn.disabled=false;

      btn.textContent=
        "Bayar & Buat Pesanan →";
    }
  };
}


/* =========================
   RIWAYAT PESANAN
========================= */

async function orders(){
  const box=$("#orders");

  if(!box)return;

  if(!window.supabaseClient){
    box.innerHTML=`
      <div class="empty">
        Supabase belum terhubung.
      </div>
    `;

    return;
  }

  const {
    data,
    error
  }=
    await window.supabaseClient
      .from("orders")
      .select("*")
      .order(
        "created_at",
        {ascending:false}
      )
      .limit(50);

  if(error){
    box.innerHTML=`
      <div class="empty">
        ${esc(error.message)}
      </div>
    `;

    return;
  }

  if(!data?.length){
    box.innerHTML=`
      <div class="empty">
        Belum ada riwayat transaksi.
      </div>
    `;

    return;
  }

  box.innerHTML=data.map(o=>`
    <article class="order-card">

      <div class="row">

        <div>
          <b>
            ${esc(o.product_name)}
          </b>

          <div class="muted">
            ${esc(o.order_code||o.id)}
            •
            ${o.created_at
              ? new Date(o.created_at)
                  .toLocaleString("id-ID")
              : "-"
            }
          </div>
        </div>

        <span class="badge">
          ${esc(o.status)}
        </span>

      </div>

      <hr style="border-color:#17344f">

      <div class="order-row">
        <span>Total</span>

        <b class="price">
          ${money(o.amount)}
        </b>
      </div>

      <div
        class="muted"
        style="margin-top:8px"
      >
        ${esc(o.detail||"")}
      </div>

    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded",()=>{
  bindGlobal();
  renderHome();
  logoGallery();

  const p=document.body.dataset.page;

  if(
    p==="game" ||
    p==="virtual" ||
    p==="logo"
  ){
    productPage(p);
  }

  if(p==="checkout"){
    checkout();
  }

  if(p==="orders"){
    orders();
  }
});