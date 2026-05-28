import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   VAULT STORE — E-commerce Premium · Haïti 🇭🇹
   ✅ Client reste sur le site après commande
   ✅ WA reçoit la commande en arrière-plan
   ✅ Aucun bouton Admin visible côté client
   ✅ Admin accessible via code secret uniquement
   ✅ Scroll horizontal produits sur l'accueil
   ✅ Produits personnalisables (vêtements, accessoires, tech)
═══════════════════════════════════════════════════════════ */

const ADMIN_CODE = "vault2026"; // Code secret admin
const WA_NUM    = "509137327541"; // 
const fmt  = n  => `G ${Number(n).toLocaleString("fr")}`;
const uid  = () => "VS-" + Math.random().toString(36).substr(2,6).toUpperCase();
const now  = () => new Date().toLocaleDateString("fr-HT",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});

/* ─── DONNÉES PRODUITS ─────────────────────────────────── */
const INIT_PRODUCTS = [
  // Vêtements
  {id:1,  name:"Robe Brodée Créole",    price:3500, old:4200,  cat:"Vêtements",   emoji:"👗", tag:"🇭🇹 Local",  stock:15, sold:118, active:true, desc:"Robe traditionnelle haïtienne brodée à la main. Tissu léger et confortable."},
  {id:2,  name:"Chemise Lin Premium",   price:2800, old:null,  cat:"Vêtements",   emoji:"👔", tag:"🔥 Top",     stock:22, sold:87,  active:true, desc:"Chemise en lin naturel. Coupe moderne et élégante."},
  {id:3,  name:"Jean Slim Dark",        price:4500, old:5500,  cat:"Vêtements",   emoji:"👖", tag:"⚡ Flash",   stock:18, sold:203, active:true, desc:"Jean slim coupe moderne. Tissu stretch confortable."},
  {id:4,  name:"Robe Soirée Noire",     price:6800, old:8000,  cat:"Vêtements",   emoji:"🥻", tag:"🔥 Top",     stock:8,  sold:56,  active:true, desc:"Robe de soirée élégante. Parfaite pour les événements."},
  {id:5,  name:"T-Shirt Vault Store",   price:1200, old:null,  cat:"Vêtements",   emoji:"👕", tag:"🇭🇹 Local",  stock:50, sold:342, active:true, desc:"T-shirt premium avec logo Vault Store. 100% coton."},
  // Accessoires
  {id:6,  name:"Sac Cuir Noir",         price:7500, old:9000,  cat:"Accessoires", emoji:"👜", tag:"🔥 Top",     stock:12, sold:94,  active:true, desc:"Sac en cuir véritable. Compartiments multiples."},
  {id:7,  name:"Montre Classique Gold", price:8500, old:10000, cat:"Accessoires", emoji:"⌚", tag:"⚡ Flash",   stock:7,  sold:67,  active:true, desc:"Montre classique boîtier doré. Bracelet cuir marron."},
  {id:8,  name:"Lunettes de Soleil",    price:3200, old:null,  cat:"Accessoires", emoji:"🕶️", tag:null,         stock:25, sold:189, active:true, desc:"Lunettes de soleil UV400. Style moderne."},
  {id:9,  name:"Ceinture Cuir Brun",    price:1800, old:2200,  cat:"Accessoires", emoji:"🪢", tag:"⚡ Flash",   stock:30, sold:145, active:true, desc:"Ceinture en cuir véritable. Boucle argentée."},
  {id:10, name:"Chapeau Panama",        price:2500, old:null,  cat:"Accessoires", emoji:"🎩", tag:"🇭🇹 Local",  stock:20, sold:78,  active:true, desc:"Chapeau Panama tressé à la main. Style tropical."},
  // Tech
  {id:11, name:"iPhone 15 Pro Max",     price:58000,old:68000, cat:"Tech",        emoji:"📱", tag:"⚡ Flash",   stock:5,  sold:34,  active:true, desc:"iPhone 15 Pro Max 256GB. Couleur titane naturel."},
  {id:12, name:"Casque Sony WH-1000",   price:12000,old:15000, cat:"Tech",        emoji:"🎧", tag:"🔥 Top",     stock:9,  sold:67,  active:true, desc:"Casque Bluetooth premium. Réduction de bruit active."},
  {id:13, name:"Chargeur Solaire 30W",  price:4200, old:null,  cat:"Tech",        emoji:"☀️", tag:"🇭🇹 Local",  stock:40, sold:312, active:true, desc:"Chargeur solaire portable 30W. Parfait pour Haïti."},
  {id:14, name:"Samsung Galaxy S25",    price:45000,old:52000, cat:"Tech",        emoji:"📲", tag:"⚡ Flash",   stock:6,  sold:45,  active:true, desc:"Samsung Galaxy S25 128GB. Écran AMOLED 6.2\"."},
  {id:15, name:"Lampe LED Solaire",     price:1800, old:null,  cat:"Tech",        emoji:"💡", tag:"🇭🇹 Local",  stock:60, sold:891, active:true, desc:"Lampe LED solaire rechargeable. Idéale pour coupures."},
];

const ZONES = [
  {name:"Port-au-Prince", frais:200, delai:"Même jour"},
  {name:"Delmas",         frais:250, delai:"Même jour"},
  {name:"Pétion-Ville",   frais:300, delai:"2-4 heures"},
  {name:"Province",       frais:800, delai:"1-2 jours"},
];

const INIT_ORDERS = [
  {id:"VS-A7K2X1",client:"Marie Joseph",   phone:"50937201234",zone:"Port-au-Prince",addr:"Rue Pavée #12",   total:58000,pay:"MonCash", status:"En livraison",date:"27 Mai, 14:30",items:[{name:"iPhone 15 Pro Max",emoji:"📱",qty:1,price:58000}],   payProof:true },
  {id:"VS-B3M9P2",client:"Jean Pierre",    phone:"50944567890",zone:"Pétion-Ville",  addr:"Delmas 31 #45",  total:16300,pay:"NatCash", status:"Confirmée",   date:"27 Mai, 11:15",items:[{name:"Casque Sony",emoji:"🎧",qty:1,price:12000},{name:"Ceinture",emoji:"🪢",qty:4,price:1800}],payProof:true },
  {id:"VS-C5R7T3",client:"Sophie Duval",   phone:"50928345678",zone:"Delmas",        addr:"Delmas 60 #8",   total:7000, pay:"Cash",    status:"En attente",  date:"27 Mai, 09:45",items:[{name:"Robe Brodée",emoji:"👗",qty:2,price:3500}],           payProof:false},
  {id:"VS-D1Q4W4",client:"Marc Antoine",   phone:"50915678901",zone:"Province",      addr:"Cap-Haïtien",    total:4200, pay:"MonCash", status:"Livrée",      date:"26 Mai, 16:20",items:[{name:"Chargeur Solaire",emoji:"☀️",qty:1,price:4200}],      payProof:true },
  {id:"VS-E9L6S5",client:"Rose Bellevue",  phone:"50952890123",zone:"Pétion-Ville",  addr:"Rue Pan Am #3",  total:19000,pay:"NatCash", status:"En attente",  date:"27 Mai, 08:00",items:[{name:"Montre Gold",emoji:"⌚",qty:2,price:8500}],            payProof:false},
];

const STATUS_COLORS = {
  "En attente":   {bg:"rgba(245,158,11,.15)",  color:"#F59E0B", border:"rgba(245,158,11,.3)"},
  "Confirmée":    {bg:"rgba(59,130,246,.15)",  color:"#60A5FA", border:"rgba(59,130,246,.3)"},
  "En livraison": {bg:"rgba(168,85,247,.15)",  color:"#C084FC", border:"rgba(168,85,247,.3)"},
  "Livrée":       {bg:"rgba(34,197,94,.15)",   color:"#4ADE80", border:"rgba(34,197,94,.3)"},
};

const CATS = ["Tout","Vêtements","Accessoires","Tech"];
const WEEKLY  = [85,140,195,160,280,240,380];
const MONTHLY = [2800,3600,3200,4800,4200,5600,5100,6800,6200,7800,7100,9000];
const DAYS    = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

/* ─── HELPERS ──────────────────────────────────────────── */
const WAIcon = ({size=18,color="white"})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function TrackingBar({status}){
  const steps=["En attente","Confirmée","En livraison","Livrée"];
  const idx=steps.indexOf(status);
  return(
    <div style={{display:"flex",alignItems:"center",margin:"12px 0"}}>
      {steps.map((s,i)=>(
        <div key={s} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:0}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:i<=idx?"linear-gradient(135deg,#D4AF37,#F5E070)":"rgba(255,255,255,.08)",border:i<=idx?"none":"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:i<=idx?"#1a1a1a":"#334155",boxShadow:i<=idx?"0 0 10px rgba(212,175,55,.4)":"none"}}>{i<=idx?"✓":i+1}</div>
            <span style={{fontSize:8,color:i<=idx?"#D4AF37":"#334155",fontWeight:700,whiteSpace:"nowrap"}}>{s}</span>
          </div>
          {i<steps.length-1&&<div style={{flex:1,height:2,background:i<idx?"linear-gradient(90deg,#D4AF37,#F5E070)":"rgba(255,255,255,.06)",margin:"0 3px",marginBottom:14,transition:"all .3s"}}/>}
        </div>
      ))}
    </div>
  );
}

function BarChart({data,labels,color="#D4AF37"}){
  const max=Math.max(...data);
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
      {data.map((v,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:`linear-gradient(180deg,${color},${color}88)`,height:`${(v/max)*70}px`,minHeight:4,boxShadow:`0 0 6px ${color}44`}}/>
          <span style={{fontSize:9,color:"#475569",fontWeight:600}}>{labels?.[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function VaultStore(){
  /* ── STATE ── */
  const [page,       setPage]       = useState("client"); // client | admin
  const [adminTab,   setAdminTab]   = useState("dashboard");
  const [products,   setProducts]   = useState(INIT_PRODUCTS);
  const [orders,     setOrders]     = useState(INIT_ORDERS);
  const [zones,      setZones]      = useState(ZONES);
  const [cart,       setCart]       = useState([]);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [catFilter,  setCatFilter]  = useState("Tout");
  const [search,     setSearch]     = useState("");
  const [promoCode,  setPromoCode]  = useState("");
  const [promoOk,    setPromoOk]    = useState(false);
  const [checkout,   setCheckout]   = useState(false);
  const [form,       setForm]       = useState({name:"",phone:"",addr:"",zone:"Port-au-Prince",pay:"MonCash"});
  const [success,    setSuccess]    = useState(null);   // order object after placed
  const [toast,      setToast]      = useState(null);
  const [prodModal,  setProdModal]  = useState(null);
  const [orderDetail,setOrderDetail]= useState(null);
  const [newProd,    setNewProd]    = useState(false);
  const [editProd,   setEditProd]   = useState(null);
  const [adminInput, setAdminInput] = useState("");
  const [adminErr,   setAdminErr]   = useState(false);
  const [keyBuffer,  setKeyBuffer]  = useState("");     // secret key sequence
  const hScrollRef  = useRef(null);

  /* ── SECRET ADMIN TRIGGER ──
     Tape "vault" sur le clavier n'importe où sur le site → page admin s'affiche */
  useEffect(()=>{
    if(page!=="client") return;
    const handler = e => {
      const nb = (keyBuffer + e.key).slice(-5);
      setKeyBuffer(nb);
      if(nb === "vault") { setPage("admin-login"); setKeyBuffer(""); }
    };
    window.addEventListener("keydown", handler);
    return ()=> window.removeEventListener("keydown", handler);
  },[keyBuffer, page]);

  /* ── TOAST ── */
  const toast$ = (msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  /* ── CART ── */
  const addCart = p => {
    setCart(prev=>{ const ex=prev.find(i=>i.id===p.id); return ex?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,qty:1}]; });
    toast$(`${p.emoji} "${p.name}" ajouté au panier`);
  };
  const updQty  = (id,d) => setCart(prev=>prev.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i));
  const delItem = id     => setCart(prev=>prev.filter(i=>i.id!==id));
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const discount  = promoOk ? Math.floor(cartTotal*.1) : 0;
  const delivery  = zones.find(z=>z.name===form.zone)?.frais || 250;

  /* ── PLACE ORDER — Client reste sur le site, WA reçoit en arrière-plan ── */
  const placeOrder = () => {
    if(!form.name||!form.phone||!form.addr){ toast$("Remplissez tous les champs","err"); return; }
    const ord = {
      id:uid(), client:form.name, phone:form.phone,
      zone:form.zone, addr:form.addr,
      total:cartTotal-discount+delivery,
      pay:form.pay, status:"En attente", date:now(),
      items:cart.map(i=>({name:i.name,emoji:i.emoji,qty:i.qty,price:i.price})),
      payProof:false
    };
    setOrders(prev=>[ord,...prev]);

    // ── Message WhatsApp formaté ──
    const lines = cart.map(i=>`  • ${i.name} ×${i.qty} → ${fmt(i.price*i.qty)}`);
    const msg = [
      "🏪 *VAULT STORE — NOUVELLE COMMANDE*",
      "━━━━━━━━━━━━━━━━━━━━━",
      `🆔 *${ord.id}*`,
      `👤 ${ord.client}`,
      `📞 ${ord.phone}`,
      `📍 ${ord.zone} · ${ord.addr}`,
      `💳 ${ord.pay}`,
      "━━━━━━━━━━━━━━━━━━━━━",
      ...lines,
      "━━━━━━━━━━━━━━━━━━━━━",
      promoOk ? `🎁 Promo: -${fmt(discount)}` : "",
      `🚚 Livraison: ${fmt(delivery)}`,
      `💰 *TOTAL: ${fmt(ord.total)}*`,
      "━━━━━━━━━━━━━━━━━━━━━",
      "🇭🇹 Vault Store Haiti"
    ].filter(Boolean).join("\n");

    // Ouvre WA dans un mini-onglet caché → ferme après 2s → client ne bouge pas
    try {
      const ghost = window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,"_blank","width=10,height=10,left=-2000");
      setTimeout(()=>{ try{ ghost && ghost.close(); }catch(e){} }, 2500);
    } catch(e){}

    // Reset & afficher page de succès
    setCart([]); setCheckout(false); setPromoOk(false); setPromoCode("");
    setForm({name:"",phone:"",addr:"",zone:"Port-au-Prince",pay:"MonCash"});
    setSuccess(ord);
  };

  /* ── ADMIN ── */
  const adminLogin = () => {
    if(adminInput===ADMIN_CODE){ setPage("admin"); setAdminErr(false); setAdminInput(""); }
    else{ setAdminErr(true); setTimeout(()=>setAdminErr(false),2000); }
  };
  const updateStatus = (id,status)=>{ setOrders(p=>p.map(o=>o.id===id?{...o,status}:o)); toast$("Statut mis à jour"); };
  const toggleProd   = id => setProducts(p=>p.map(pr=>pr.id===id?{...pr,active:!pr.active}:pr));
  const deleteProd   = id => { setProducts(p=>p.filter(pr=>pr.id!==id)); toast$("Produit supprimé","err"); };
  const saveProd     = p  => {
    if(p.id){ setProducts(prev=>prev.map(pr=>pr.id===p.id?p:pr)); toast$("Produit modifié"); }
    else    { setProducts(prev=>[...prev,{...p,id:Date.now(),sold:0,active:true}]); toast$("Produit ajouté !"); }
    setEditProd(null); setNewProd(false);
  };

  const filteredProds = products.filter(p=>p.active&&(catFilter==="Tout"||p.cat===catFilter)&&p.name.toLowerCase().includes(search.toLowerCase()));
  const totalRevenue  = orders.reduce((s,o)=>s+o.total,0);
  const pendingCount  = orders.filter(o=>o.status==="En attente").length;
  const deliveredCount= orders.filter(o=>o.status==="Livrée").length;

  /* ════════════════════════════════════════════════════════
     STYLES GLOBAUX
  ════════════════════════════════════════════════════════ */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(212,175,55,.3);border-radius:4px;}
    @keyframes fadeUp  {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
    @keyframes slideR  {from{transform:translateX(100%)}to{transform:translateX(0)}}
    @keyframes slideUp {from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes toastIn {from{opacity:0;transform:translateY(16px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes waPulse {0%,100%{box-shadow:0 0 20px rgba(37,211,102,.3)}50%{box-shadow:0 0 48px rgba(37,211,102,.7)}}
    @keyframes glow    {0%,100%{box-shadow:0 0 20px rgba(212,175,55,.2)}50%{box-shadow:0 0 50px rgba(212,175,55,.5)}}
    @keyframes ticker  {0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes errShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
    @keyframes spinRing{to{transform:rotate(360deg)}}
    @keyframes successPop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    input,select,textarea,button{font-family:'DM Sans',sans-serif;}
    input:focus,select:focus,textarea:focus{outline:none;}
    .fade-up{animation:fadeUp .6s ease both;}
    .prod-card{transition:all .3s cubic-bezier(.4,0,.2,1);}
    .prod-card:hover{transform:translateY(-6px)!important;border-color:rgba(212,175,55,.4)!important;box-shadow:0 20px 50px rgba(0,0,0,.5),0 0 30px rgba(212,175,55,.08)!important;}
    .sidebar-btn{transition:all .2s;border-radius:10px;}
    .sidebar-btn:hover{background:rgba(212,175,55,.08)!important;color:#D4AF37!important;}
    .stat-card:hover{transform:translateY(-3px);}
    .order-row:hover{background:rgba(212,175,55,.03)!important;}
    .nav-sticky{position:sticky;top:0;z-index:50;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}
    .hscroll::-webkit-scrollbar{height:3px;}
    .hscroll{scrollbar-width:thin;scrollbar-color:rgba(212,175,55,.3) transparent;}
  `;

  const root = {fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0A0A0A",minHeight:"100vh",color:"#E8E0D0",overflowX:"hidden"};

  /* ════════════════════════════════════════════════════════
     ADMIN LOGIN (accès secret)
  ════════════════════════════════════════════════════════ */
  if(page==="admin-login") return (
    <div style={{...root,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <style>{css}</style>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center,rgba(212,175,55,.06),transparent 70%)"}}/>
      <div className="fade-up" style={{width:380,padding:"44px 40px",background:"rgba(15,12,8,.97)",border:"1px solid rgba(212,175,55,.2)",borderRadius:20,boxShadow:"0 30px 80px rgba(0,0,0,.8)",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#D4AF37,#8B7415)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px",animation:"glow 3s infinite"}}>🏛️</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,letterSpacing:2,color:"#D4AF37"}}>VAULT STORE</h1>
          <p style={{color:"#475569",fontSize:12,marginTop:4,letterSpacing:1}}>ACCÈS ADMINISTRATEUR</p>
        </div>
        <label style={{fontSize:11,color:"#64748B",fontWeight:600,display:"block",marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>Code d'accès</label>
        <input
          type="password" value={adminInput}
          onChange={e=>setAdminInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&adminLogin()}
          placeholder="••••••••"
          style={{width:"100%",padding:"13px 16px",background:"rgba(255,255,255,.05)",border:`1px solid ${adminErr?"rgba(239,68,68,.5)":"rgba(212,175,55,.2)"}`,borderRadius:12,color:"#E8E0D0",fontSize:15,marginBottom:6,animation:adminErr?"errShake .4s ease":"none",transition:"border-color .2s"}}
        />
        {adminErr && <p style={{color:"#EF4444",fontSize:12,marginBottom:10}}>❌ Code incorrect</p>}
        <button onClick={adminLogin} style={{width:"100%",marginTop:12,padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 6px 24px rgba(212,175,55,.3)"}}>
          Accéder au Dashboard
        </button>
        <button onClick={()=>setPage("client")} style={{width:"100%",marginTop:12,padding:"10px",background:"none",border:"none",color:"#334155",fontSize:13,cursor:"pointer"}}>← Retour au site</button>
        <p style={{textAlign:"center",marginTop:16,fontSize:11,color:"#1E293B"}}>💡 Sur le site: tapez "vault" au clavier</p>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════
     ADMIN DASHBOARD
  ════════════════════════════════════════════════════════ */
  if(page==="admin") return (
    <div style={{...root,display:"flex"}}>
      <style>{css}</style>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:toast.type==="err"?"rgba(239,68,68,.15)":"rgba(212,175,55,.12)",border:`1px solid ${toast.type==="err"?"rgba(239,68,68,.3)":"rgba(212,175,55,.3)"}`,borderRadius:12,padding:"13px 20px",color:toast.type==="err"?"#FCA5A5":"#D4AF37",fontWeight:700,fontSize:14,backdropFilter:"blur(10px)",animation:"toastIn .3s ease",boxShadow:"0 8px 30px rgba(0,0,0,.4)"}}>{toast.msg}</div>}

      {/* Sidebar */}
      <aside style={{width:230,flexShrink:0,height:"100vh",position:"sticky",top:0,background:"rgba(8,6,4,.98)",borderRight:"1px solid rgba(212,175,55,.1)",display:"flex",flexDirection:"column",padding:"22px 14px",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32,paddingLeft:6}}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#D4AF37,#8B7415)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:"0 4px 14px rgba(212,175,55,.3)"}}>🏛️</div>
          <div>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:16,color:"#D4AF37",letterSpacing:1}}>VAULT</span>
            <p style={{fontSize:9,color:"#334155",letterSpacing:1}}>ADMIN PANEL</p>
          </div>
        </div>

        {[
          {id:"dashboard",icon:"📊",label:"Dashboard"},
          {id:"orders",   icon:"📦",label:"Commandes", badge:pendingCount},
          {id:"products", icon:"🛍️",label:"Produits"},
          {id:"delivery", icon:"🚚",label:"Livraison"},
          {id:"payments", icon:"💳",label:"Paiements"},
          {id:"analytics",icon:"📈",label:"Analytics"},
          {id:"settings", icon:"⚙️",label:"Paramètres"},
        ].map(item=>(
          <button key={item.id} className="sidebar-btn" onClick={()=>setAdminTab(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",border:"none",background:adminTab===item.id?"rgba(212,175,55,.12)":"transparent",color:adminTab===item.id?"#D4AF37":"#475569",fontWeight:adminTab===item.id?700:500,fontSize:13,textAlign:"left",marginBottom:3,borderLeft:adminTab===item.id?"2px solid #D4AF37":"2px solid transparent",cursor:"pointer"}}>
            <span style={{fontSize:16}}>{item.icon}</span>
            <span style={{flex:1}}>{item.label}</span>
            {item.badge>0&&<span style={{background:"#EF4444",color:"#fff",borderRadius:20,padding:"1px 6px",fontSize:10,fontWeight:800}}>{item.badge}</span>}
          </button>
        ))}

        <div style={{marginTop:"auto",paddingTop:18,borderTop:"1px solid rgba(255,255,255,.05)"}}>
          <button onClick={()=>setPage("client")} style={{width:"100%",padding:"9px",borderRadius:10,border:"1px solid rgba(212,175,55,.2)",background:"transparent",color:"#D4AF37",fontWeight:700,fontSize:12,marginBottom:8,cursor:"pointer"}}>🌐 Voir le site</button>
          <button onClick={()=>setPage("client")} style={{width:"100%",padding:"9px",borderRadius:10,border:"none",background:"rgba(239,68,68,.1)",color:"#FCA5A5",fontWeight:700,fontSize:12,cursor:"pointer"}}>🚪 Déconnexion</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflowY:"auto",padding:"28px 30px",background:"#0A0A0A"}}>

        {/* ── DASHBOARD ── */}
        {adminTab==="dashboard"&&(
          <div className="fade-up">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
              <div>
                <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:"#D4AF37",letterSpacing:1}}>Tableau de bord</h1>
                <p style={{color:"#475569",fontSize:13,marginTop:3}}>🇭🇹 {now()} · Bienvenue !</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"#4ADE80",animation:"glow 2s infinite"}}/>
                <span style={{fontSize:12,color:"#4ADE80",fontWeight:700}}>Système actif</span>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
              {[
                {icon:"💰",label:"Revenus",     val:fmt(totalRevenue),color:"#D4AF37"},
                {icon:"📦",label:"Commandes",   val:orders.length,    color:"#A78BFA"},
                {icon:"⏳",label:"En attente",  val:pendingCount,     color:"#F59E0B"},
                {icon:"✅",label:"Livrées",      val:deliveredCount,   color:"#4ADE80"},
              ].map(s=>(
                <div key={s.label} className="stat-card" style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"18px 20px",transition:"transform .2s",position:"relative",overflow:"hidden",cursor:"default"}}>
                  <div style={{position:"absolute",top:-16,right:-16,fontSize:56,opacity:.05}}>{s.icon}</div>
                  <span style={{fontSize:24}}>{s.icon}</span>
                  <p style={{margin:"8px 0 3px",fontSize:22,fontWeight:800,color:s.color}}>{s.val}</p>
                  <p style={{fontSize:12,color:"#475569",fontWeight:600}}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:20}}>
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px"}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:4}}>Ventes hebdomadaires</h3>
                <p style={{color:"#475569",fontSize:11,marginBottom:14}}>Chiffre d'affaires en gourdes</p>
                <BarChart data={WEEKLY} labels={DAYS} color="#D4AF37"/>
              </div>
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px"}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>🏆 Top produits</h3>
                {[...products].sort((a,b)=>b.sold-a.sold).slice(0,5).map((p,i)=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:18}}>{p.emoji}</span>
                    <div style={{flex:1,overflow:"hidden"}}>
                      <p style={{fontSize:12,fontWeight:700,color:"#E2E8F0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</p>
                      <p style={{fontSize:10,color:"#475569"}}>{p.sold} vendus</p>
                    </div>
                    <span style={{fontSize:11,fontWeight:800,color:"#D4AF37"}}>#{i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px"}}>
              <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>📦 Dernières commandes</h3>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    {["ID","Client","Zone","Total","Paiement","Statut",""].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0,5).map(o=>{
                    const sc=STATUS_COLORS[o.status];
                    return(
                      <tr key={o.id} className="order-row" style={{borderBottom:"1px solid rgba(255,255,255,.03)",transition:"background .2s"}}>
                        <td style={{padding:"11px 10px",fontSize:11,color:"#D4AF37",fontWeight:700}}>{o.id}</td>
                        <td style={{padding:"11px 10px",fontSize:12,fontWeight:600}}>{o.client}</td>
                        <td style={{padding:"11px 10px",fontSize:11,color:"#64748B"}}>{o.zone}</td>
                        <td style={{padding:"11px 10px",fontSize:12,fontWeight:800,color:"#D4AF37"}}>{fmt(o.total)}</td>
                        <td style={{padding:"11px 10px",fontSize:11,color:"#64748B"}}>{o.pay}</td>
                        <td style={{padding:"11px 10px"}}>
                          <span style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700}}>{o.status}</span>
                        </td>
                        <td style={{padding:"11px 10px"}}>
                          <button onClick={()=>{setOrderDetail(o);setAdminTab("orders")}} style={{background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.2)",color:"#D4AF37",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Voir</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {adminTab==="orders"&&(
          <div className="fade-up">
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#D4AF37",letterSpacing:1,marginBottom:22}}>📦 Commandes</h1>
            {orderDetail?(
              <div>
                <button onClick={()=>setOrderDetail(null)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,padding:"7px 14px",color:"#94A3B8",fontWeight:600,fontSize:12,marginBottom:20,cursor:"pointer"}}>← Retour</button>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                  <div>
                    <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"22px",marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                        <div>
                          <h2 style={{fontWeight:800,fontSize:18,color:"#D4AF37"}}>{orderDetail.id}</h2>
                          <p style={{color:"#475569",fontSize:12,marginTop:3}}>{orderDetail.date}</p>
                        </div>
                        {(()=>{const sc=STATUS_COLORS[orderDetail.status];return(<span style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:800}}>{orderDetail.status}</span>);})()}
                      </div>
                      <TrackingBar status={orderDetail.status}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:18}}>
                        {[["👤 Client",orderDetail.client],["📞 Téléphone",orderDetail.phone],["📍 Zone",orderDetail.zone],["🏠 Adresse",orderDetail.addr]].map(([l,v])=>(
                          <div key={l} style={{background:"rgba(255,255,255,.02)",borderRadius:10,padding:"12px"}}>
                            <p style={{fontSize:10,color:"#475569",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{l}</p>
                            <p style={{fontWeight:700,fontSize:13}}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"18px"}}>
                      <h3 style={{fontWeight:700,fontSize:14,marginBottom:12}}>Articles</h3>
                      {orderDetail.items.map((it,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                          <span style={{fontSize:26,background:"rgba(255,255,255,.04)",borderRadius:9,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center"}}>{it.emoji}</span>
                          <div style={{flex:1}}>
                            <p style={{fontWeight:700,fontSize:13}}>{it.name}</p>
                            <p style={{color:"#475569",fontSize:11}}>×{it.qty} · {fmt(it.price)}</p>
                          </div>
                          <span style={{fontWeight:800,color:"#D4AF37",fontSize:13}}>{fmt(it.price*it.qty)}</span>
                        </div>
                      ))}
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                        <span style={{fontWeight:700,fontSize:15}}>Total</span>
                        <span style={{fontWeight:900,fontSize:18,color:"#D4AF37"}}>{fmt(orderDetail.total)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"18px",marginBottom:14}}>
                      <h3 style={{fontWeight:700,fontSize:14,marginBottom:12}}>⚡ Changer statut</h3>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        {["En attente","Confirmée","En livraison","Livrée"].map(s=>{
                          const sc=STATUS_COLORS[s]; const active=orderDetail.status===s;
                          return(<button key={s} onClick={()=>{updateStatus(orderDetail.id,s);setOrderDetail({...orderDetail,status:s})}} style={{padding:"9px 10px",borderRadius:9,fontWeight:700,fontSize:11,background:active?sc.bg:"rgba(255,255,255,.02)",border:`1px solid ${active?sc.border:"rgba(255,255,255,.07)"}`,color:active?sc.color:"#475569",cursor:"pointer",transition:"all .2s"}}>{s}</button>);
                        })}
                      </div>
                    </div>
                    <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"18px",marginBottom:14}}>
                      <h3 style={{fontWeight:700,fontSize:14,marginBottom:12}}>💳 Paiement</h3>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{color:"#64748B",fontSize:13}}>Méthode</span>
                        <span style={{fontWeight:800}}>{orderDetail.pay==="MonCash"?"📱":orderDetail.pay==="NatCash"?"💳":"💵"} {orderDetail.pay}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                        <span style={{color:"#64748B",fontSize:13}}>Preuve</span>
                        <span style={{color:orderDetail.payProof?"#4ADE80":"#F59E0B",fontWeight:800,fontSize:12}}>{orderDetail.payProof?"✅ Confirmée":"⏳ En attente"}</span>
                      </div>
                      {!orderDetail.payProof&&(
                        <button onClick={()=>setOrderDetail({...orderDetail,payProof:true})} style={{width:"100%",padding:"9px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:12,cursor:"pointer"}}>✅ Confirmer paiement</button>
                      )}
                    </div>
                    <button onClick={()=>window.open(`https://wa.me/${orderDetail.phone}?text=Bonjour ${orderDetail.client}! Votre commande ${orderDetail.id} est: *${orderDetail.status}* 🇭🇹`,"_blank")} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#25D366,#128C7E)",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(37,211,102,.3)"}}>
                      <WAIcon size={16}/> Contacter le client
                    </button>
                  </div>
                </div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {orders.map(o=>{
                  const sc=STATUS_COLORS[o.status];
                  return(
                    <div key={o.id} className="order-row" style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:14,padding:"16px 18px",display:"grid",gridTemplateColumns:"auto 1fr auto auto auto auto",alignItems:"center",gap:14,transition:"background .2s",cursor:"pointer"}} onClick={()=>setOrderDetail(o)}>
                      <span style={{fontSize:20}}>{o.pay==="MonCash"?"📱":o.pay==="NatCash"?"💳":"💵"}</span>
                      <div>
                        <p style={{fontWeight:800,fontSize:13,color:"#D4AF37"}}>{o.id}</p>
                        <p style={{fontSize:12,color:"#E2E8F0",margin:"2px 0"}}>{o.client} · {o.phone}</p>
                        <p style={{fontSize:11,color:"#475569"}}>📍 {o.zone} · {o.date}</p>
                      </div>
                      <span style={{fontWeight:900,color:"#D4AF37",fontSize:15}}>{fmt(o.total)}</span>
                      <span style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{o.status}</span>
                      <span style={{fontSize:11,color:o.payProof?"#4ADE80":"#F59E0B",fontWeight:700}}>{o.payProof?"✅ Payé":"⏳ Paiement"}</span>
                      <span style={{color:"#D4AF37",fontSize:16}}>→</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {adminTab==="products"&&(
          <div className="fade-up">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#D4AF37",letterSpacing:1}}>🛍️ Produits</h1>
              <button onClick={()=>{setNewProd(true);setEditProd({name:"",price:"",old:"",cat:"Vêtements",emoji:"👕",stock:"",desc:"",tag:""})}} style={{background:"linear-gradient(135deg,#D4AF37,#8B7415)",border:"none",borderRadius:11,padding:"10px 18px",color:"#0A0A0A",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:"0 4px 16px rgba(212,175,55,.3)"}}>+ Nouveau produit</button>
            </div>

            {/* Form ajout/modif */}
            {(newProd||editProd?.id)&&(
              <div style={{background:"rgba(212,175,55,.05)",border:"1px solid rgba(212,175,55,.2)",borderRadius:16,padding:"22px",marginBottom:22}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:18,color:"#D4AF37"}}>{newProd?"➕ Nouveau produit":"✏️ Modifier le produit"}</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  {[{l:"Nom",k:"name",col:"1/-1"},{l:"Emoji",k:"emoji"},{l:"Prix (G)",k:"price",t:"number"},{l:"Ancien prix",k:"old",t:"number"},{l:"Stock",k:"stock",t:"number"},{l:"Description",k:"desc",col:"1/-1"}].map(f=>(
                    <div key={f.k} style={{gridColumn:f.col}}>
                      <label style={{fontSize:11,color:"#64748B",display:"block",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{f.l}</label>
                      <input type={f.t||"text"} value={editProd?.[f.k]||""} onChange={e=>setEditProd(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"10px 13px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#E8E0D0",fontSize:13}}/>
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:11,color:"#64748B",display:"block",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Catégorie</label>
                    <select value={editProd?.cat||"Vêtements"} onChange={e=>setEditProd(p=>({...p,cat:e.target.value}))} style={{width:"100%",padding:"10px 13px",background:"rgba(10,8,6,.95)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#E8E0D0",fontSize:13}}>
                      {["Vêtements","Accessoires","Tech"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:"#64748B",display:"block",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Tag</label>
                    <select value={editProd?.tag||""} onChange={e=>setEditProd(p=>({...p,tag:e.target.value}))} style={{width:"100%",padding:"10px 13px",background:"rgba(10,8,6,.95)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"#E8E0D0",fontSize:13}}>
                      <option value="">Aucun</option>
                      <option>🔥 Top</option><option>⚡ Flash</option><option>🇭🇹 Local</option>
                    </select>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button onClick={()=>saveProd({...editProd,price:Number(editProd.price),old:editProd.old?Number(editProd.old):null,stock:Number(editProd.stock)})} style={{flex:1,padding:"11px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:13,cursor:"pointer"}}>✅ Sauvegarder</button>
                  <button onClick={()=>{setNewProd(false);setEditProd(null)}} style={{flex:1,padding:"11px",borderRadius:9,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#64748B",fontWeight:700,fontSize:13,cursor:"pointer"}}>Annuler</button>
                </div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
              {products.map(p=>(
                <div key={p.id} style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,overflow:"hidden",opacity:p.active?1:.45,transition:"opacity .2s"}}>
                  <div style={{height:90,background:"rgba(255,255,255,.03)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,position:"relative"}}>
                    {p.emoji}
                    <span style={{position:"absolute",top:8,right:8,fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:p.active?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)",color:p.active?"#4ADE80":"#FCA5A5",border:`1px solid ${p.active?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`}}>{p.active?"● Actif":"● Inactif"}</span>
                  </div>
                  <div style={{padding:"12px 14px"}}>
                    <p style={{fontWeight:700,fontSize:13,marginBottom:3}}>{p.name}</p>
                    <p style={{fontSize:11,color:"#475569",marginBottom:8}}>{p.cat} · Stock: {p.stock}</p>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <span style={{fontWeight:900,color:"#D4AF37",fontSize:15}}>{fmt(p.price)}</span>
                      {p.old&&<span style={{fontSize:11,color:"#334155",textDecoration:"line-through"}}>{fmt(p.old)}</span>}
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setEditProd(p);setNewProd(false)}} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid rgba(212,175,55,.2)",background:"transparent",color:"#D4AF37",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Modifier</button>
                      <button onClick={()=>toggleProd(p.id)} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:p.active?"rgba(245,158,11,.12)":"rgba(34,197,94,.12)",color:p.active?"#F59E0B":"#4ADE80",fontSize:11,fontWeight:700,cursor:"pointer"}}>{p.active?"Désactiver":"Activer"}</button>
                      <button onClick={()=>deleteProd(p.id)} style={{padding:"7px 10px",borderRadius:8,border:"none",background:"rgba(239,68,68,.1)",color:"#FCA5A5",fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DELIVERY ── */}
        {adminTab==="delivery"&&(
          <div className="fade-up">
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#D4AF37",letterSpacing:1,marginBottom:22}}>🚚 Livraison</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>Zones & Tarifs</h3>
                {zones.map((z,i)=>(
                  <div key={z.name} style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:14}}>📍 {z.name}</p>
                        <p style={{fontSize:11,color:"#4ADE80",marginTop:2}}>⏱️ {z.delai}</p>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <p style={{fontWeight:900,color:"#D4AF37",fontSize:17}}>{fmt(z.frais)}</p>
                        <button onClick={()=>{const v=prompt(`Frais pour ${z.name} (G):`);if(v&&!isNaN(v)){setZones(p=>p.map((zz,ii)=>ii===i?{...zz,frais:Number(v)}:zz));toast$("Frais mis à jour");}}} style={{fontSize:10,color:"#D4AF37",background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.2)",borderRadius:7,padding:"2px 9px",marginTop:3,fontWeight:700,cursor:"pointer"}}>Modifier</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>🏍️ En livraison</h3>
                {orders.filter(o=>o.status==="En livraison").map(o=>(
                  <div key={o.id} style={{background:"rgba(168,85,247,.08)",border:"1px solid rgba(168,85,247,.2)",borderRadius:12,padding:"14px",marginBottom:10}}>
                    <p style={{color:"#C084FC",fontWeight:800,fontSize:12,marginBottom:4}}>{o.id}</p>
                    <p style={{fontWeight:700,fontSize:13}}>{o.client}</p>
                    <p style={{color:"#64748B",fontSize:11}}>📍 {o.zone} · {o.addr}</p>
                    <button onClick={()=>window.open(`https://wa.me/${o.phone}`,"_blank")} style={{marginTop:8,width:"100%",padding:"7px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#25D366,#128C7E)",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      <WAIcon size={12}/> Contacter
                    </button>
                  </div>
                ))}
                {orders.filter(o=>o.status==="En livraison").length===0&&<p style={{color:"#334155",fontSize:13}}>Aucune livraison en cours</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {adminTab==="payments"&&(
          <div className="fade-up">
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#D4AF37",letterSpacing:1,marginBottom:22}}>💳 Paiements</h1>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
              {[{icon:"📱",name:"MonCash",color:"#F59E0B"},{icon:"💳",name:"NatCash",color:"#38BDF8"},{icon:"💵",name:"Cash",color:"#4ADE80"}].map(m=>{
                const ordsM=orders.filter(o=>o.pay===m.name);
                return(
                  <div key={m.name} style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px"}}>
                    <span style={{fontSize:32}}>{m.icon}</span>
                    <p style={{fontWeight:900,fontSize:20,color:m.color,margin:"8px 0 3px"}}>{fmt(ordsM.reduce((s,o)=>s+o.total,0))}</p>
                    <p style={{fontSize:12,color:"#475569"}}>{m.name} · {ordsM.length} commande{ordsM.length>1?"s":""}</p>
                    <div style={{marginTop:10,height:3,background:"rgba(255,255,255,.05)",borderRadius:2}}><div style={{height:"100%",width:`${(ordsM.length/orders.length)*100}%`,background:m.color,borderRadius:2}}/></div>
                  </div>
                );
              })}
            </div>
            <h3 style={{fontWeight:700,fontSize:15,marginBottom:12}}>⏳ À vérifier</h3>
            {orders.filter(o=>!o.payProof).map(o=>(
              <div key={o.id} style={{background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.2)",borderRadius:12,padding:"14px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontWeight:800,color:"#F59E0B",fontSize:13}}>{o.id} — {o.client}</p>
                  <p style={{color:"#64748B",fontSize:12,marginTop:3}}>{o.pay} · {fmt(o.total)} · {o.date}</p>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setOrders(p=>p.map(ord=>ord.id===o.id?{...ord,payProof:true,status:"Confirmée"}:ord));toast$(`Paiement ${o.id} confirmé !`);}} style={{background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.3)",color:"#4ADE80",borderRadius:9,padding:"7px 14px",fontWeight:800,fontSize:12,cursor:"pointer"}}>✅ Confirmer</button>
                  <button onClick={()=>window.open(`https://wa.me/${o.phone}?text=Bonjour ${o.client}, envoyez votre preuve de paiement ${o.pay} pour la commande ${o.id}. Merci!`,"_blank")} style={{background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.2)",color:"#25D366",borderRadius:9,padding:"7px 12px",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><WAIcon size={12}/> Demander</button>
                </div>
              </div>
            ))}
            {orders.filter(o=>!o.payProof).length===0&&<p style={{color:"#4ADE80",fontWeight:700}}>✅ Tous les paiements sont confirmés !</p>}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {adminTab==="analytics"&&(
          <div className="fade-up">
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#D4AF37",letterSpacing:1,marginBottom:22}}>📈 Analytics</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px"}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:4}}>Revenus mensuels</h3>
                <p style={{color:"#475569",fontSize:11,marginBottom:14}}>12 derniers mois · en gourdes</p>
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{width:"100%",height:60}}>
                  <defs><linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4AF37" stopOpacity=".3"/><stop offset="100%" stopColor="#D4AF37" stopOpacity="0"/></linearGradient></defs>
                  {(()=>{const max=Math.max(...MONTHLY);const w=100/(MONTHLY.length-1);const pts=MONTHLY.map((v,i)=>`${i*w},${50-(v/max)*46}`).join(" ");return(<><polygon points={`0,50 ${pts} 100,50`} fill="url(#gGold)"/><polyline points={pts} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>{MONTHLY.map((v,i)=><circle key={i} cx={i*w} cy={50-(v/max)*46} r="2.5" fill="#D4AF37"/>)}</>);})()}
                </svg>
                <div style={{display:"flex",gap:2,marginTop:6}}>{["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=><span key={i} style={{flex:1,textAlign:"center",fontSize:8,color:"#334155"}}>{m}</span>)}</div>
              </div>
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px"}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>Ventes par catégorie</h3>
                {[{cat:"Vêtements",pct:42,color:"#D4AF37"},{cat:"Accessoires",pct:33,color:"#A78BFA"},{cat:"Tech",pct:25,color:"#38BDF8"}].map(c=>(
                  <div key={c.cat} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,fontWeight:600}}>{c.cat}</span><span style={{fontSize:13,fontWeight:800,color:c.color}}>{c.pct}%</span></div>
                    <div style={{height:6,background:"rgba(255,255,255,.05)",borderRadius:3}}><div style={{height:"100%",width:`${c.pct}%`,background:c.color,borderRadius:3,boxShadow:`0 0 8px ${c.color}44`}}/></div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px",gridColumn:"1/-1"}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:14}}>Résumé global</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                  {[{l:"Chiffre d'affaires",v:fmt(totalRevenue),c:"#D4AF37"},{l:"Commandes",v:orders.length,c:"#A78BFA"},{l:"Panier moyen",v:fmt(Math.floor(totalRevenue/orders.length)),c:"#4ADE80"},{l:"Taux livraison",v:"94%",c:"#F59E0B"}].map(s=>(
                    <div key={s.l} style={{textAlign:"center",padding:"16px",background:"rgba(255,255,255,.02)",borderRadius:12}}>
                      <p style={{fontSize:20,fontWeight:900,color:s.c,marginBottom:4}}>{s.v}</p>
                      <p style={{fontSize:11,color:"#475569"}}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {adminTab==="settings"&&(
          <div className="fade-up">
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#D4AF37",letterSpacing:1,marginBottom:22}}>⚙️ Paramètres</h1>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              {[
                {title:"🏪 Boutique",    fields:[{l:"Nom",v:"Vault Store"},{l:"Slogan",v:"Élégance à votre porte"},{l:"WhatsApp",v:"+509 12-00-00-00"}]},
                {title:"🎨 Design",      fields:[{l:"Couleur principale",v:"#D4AF37"},{l:"Thème",v:"Dark Premium"},{l:"Logo emoji",v:"🏛️"}]},
                {title:"🔐 Sécurité",    fields:[{l:"Code admin",v:"vault2026"},{l:"Email",v:"admin@vaultstore.ht"},{l:"Session",v:"8h"}]},
                {title:"📱 Réseaux",     fields:[{l:"WhatsApp",v:WA_NUM},{l:"Instagram",v:"@vaultstore_ht"},{l:"Facebook",v:"Vault Store Haiti"}]},
              ].map(sec=>(
                <div key={sec.title} style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"20px"}}>
                  <h3 style={{fontWeight:700,fontSize:14,marginBottom:16,color:"#D4AF37"}}>{sec.title}</h3>
                  {sec.fields.map(f=>(
                    <div key={f.l} style={{marginBottom:12}}>
                      <label style={{fontSize:10,color:"#475569",display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{f.l}</label>
                      <input defaultValue={f.v} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:8,color:"#E8E0D0",fontSize:13}} onFocus={e=>e.target.style.borderColor="rgba(212,175,55,.4)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.07)"}/>
                    </div>
                  ))}
                  <button onClick={()=>toast$("Sauvegardé !")} style={{width:"100%",padding:"9px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:12,cursor:"pointer"}}>💾 Sauvegarder</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );

  /* ════════════════════════════════════════════════════════
     PAGE SUCCÈS — après commande, client reste sur le site
  ════════════════════════════════════════════════════════ */
  if(success) return (
    <div style={{...root,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24}}>
      <style>{css}</style>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center,rgba(212,175,55,.06),transparent 70%)"}}/>
      <div style={{maxWidth:480,width:"100%",textAlign:"center",position:"relative",zIndex:1,animation:"successPop .5s ease"}}>
        <div style={{fontSize:80,marginBottom:20,animation:"successPop .6s ease .1s both"}}>✅</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:"#D4AF37",letterSpacing:1,marginBottom:8}}>Commande reçue !</h1>
        <p style={{color:"#64748B",fontSize:15,marginBottom:6}}>Numéro de commande</p>
        <div style={{display:"inline-block",background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.3)",borderRadius:12,padding:"8px 24px",marginBottom:28}}>
          <span style={{fontWeight:900,fontSize:22,color:"#D4AF37",letterSpacing:2}}>{success.id}</span>
        </div>

        <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"20px",marginBottom:24,textAlign:"left"}}>
          <h3 style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#D4AF37"}}>Récapitulatif</h3>
          {success.items.map((it,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:13}}>
              <span>{it.emoji} {it.name} ×{it.qty}</span>
              <span style={{color:"#D4AF37",fontWeight:700}}>{fmt(it.price*it.qty)}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontWeight:900,fontSize:16}}>
            <span>Total payé</span>
            <span style={{color:"#D4AF37"}}>{fmt(success.total)}</span>
          </div>
        </div>

        <TrackingBar status="En attente"/>

        <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",borderRadius:14,padding:"16px",margin:"20px 0",textAlign:"left"}}>
          <p style={{color:"#4ADE80",fontWeight:700,fontSize:14,marginBottom:4}}>📲 Notre équipe vous contacte sous 30 min</p>
          <p style={{color:"#475569",fontSize:13}}>Vous recevrez une confirmation sur votre WhatsApp : <strong style={{color:"#E8E0D0"}}>{success.phone}</strong></p>
        </div>

        <button onClick={()=>setSuccess(null)} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 6px 24px rgba(212,175,55,.3)"}}>
          🛍️ Continuer les achats
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════
     SITE CLIENT
  ════════════════════════════════════════════════════════ */
  return (
    <div style={root}>
      <style>{css}</style>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:toast.type==="err"?"rgba(239,68,68,.15)":"rgba(212,175,55,.1)",border:`1px solid ${toast.type==="err"?"rgba(239,68,68,.3)":"rgba(212,175,55,.3)"}`,borderRadius:12,padding:"11px 22px",color:toast.type==="err"?"#FCA5A5":"#D4AF37",fontWeight:700,fontSize:13,backdropFilter:"blur(10px)",animation:"toastIn .3s ease",whiteSpace:"nowrap",boxShadow:"0 8px 30px rgba(0,0,0,.4)"}}>{toast.msg}</div>}

      {/* Ticker */}
      <div style={{background:"rgba(212,175,55,.08)",borderBottom:"1px solid rgba(212,175,55,.1)",height:30,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{display:"flex",gap:80,whiteSpace:"nowrap",animation:"ticker 20s linear infinite"}}>
          {[...Array(4)].map((_,i)=><span key={i} style={{fontSize:11,color:"rgba(212,175,55,.7)",fontWeight:600,letterSpacing:.5}}>🇭🇹 Livraison partout en Haïti &nbsp;·&nbsp; 💳 MonCash & NatCash &nbsp;·&nbsp; ⚡ Réponse en 30 min &nbsp;·&nbsp; 🔒 Commande sécurisée &nbsp;·&nbsp;</span>)}
        </div>
      </div>

      {/* Navbar */}
      <nav className="nav-sticky" style={{background:"rgba(10,8,6,.93)",borderBottom:"1px solid rgba(212,175,55,.08)",padding:"0 24px"}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",gap:16,height:62}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <span style={{fontSize:22}}>🏛️</span>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:22,letterSpacing:2,color:"#D4AF37"}}>VAULT STORE</span>
          </div>
          <div style={{flex:1,position:"relative",maxWidth:420}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#334155",fontSize:14}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{width:"100%",padding:"9px 14px 9px 38px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,color:"#E8E0D0",fontSize:13,transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor="rgba(212,175,55,.4)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.07)"}/>
          </div>
          <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
            {["Tout","Vêtements","Accessoires","Tech"].map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${catFilter===c?"rgba(212,175,55,.5)":"rgba(255,255,255,.07)"}`,background:catFilter===c?"rgba(212,175,55,.15)":"transparent",color:catFilter===c?"#D4AF37":"#475569",fontWeight:catFilter===c?700:500,fontSize:12,cursor:"pointer",transition:"all .2s",flexShrink:0}}>{c}</button>
            ))}
          </div>
          <button onClick={()=>setCartOpen(true)} style={{position:"relative",background:"linear-gradient(135deg,#D4AF37,#8B7415)",border:"none",borderRadius:11,padding:"9px 18px",color:"#0A0A0A",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 14px rgba(212,175,55,.3)",flexShrink:0,transition:"all .2s"}}>
            🛒 Panier
            {cartCount>0&&<span style={{background:"#EF4444",color:"#fff",borderRadius:"50%",width:19,height:19,fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{padding:"70px 24px 50px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(212,175,55,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,.025) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:-200,left:"50%",transform:"translateX(-50%)",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,175,55,.06),transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(212,175,55,.08)",border:"1px solid rgba(212,175,55,.2)",borderRadius:100,padding:"6px 18px",marginBottom:24}}>
            <span style={{color:"#4ADE80",fontSize:9}}>●</span>
            <span style={{fontSize:12,color:"#D4AF37",fontWeight:700,letterSpacing:1}}>🇭🇹 LIVRAISON ACTIVE EN HAÏTI</span>
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(40px,6vw,72px)",fontWeight:700,letterSpacing:-1,lineHeight:1.05,marginBottom:20,color:"#E8E0D0"}}>
            Élégance<br/>
            <span style={{color:"#D4AF37"}}>à votre porte.</span>
          </h1>
          <p style={{fontSize:16,color:"#475569",marginBottom:36,maxWidth:460,margin:"0 auto 36px",lineHeight:1.7}}>Vêtements, accessoires & tech premium. Livraison rapide partout en Haïti. Paiement MonCash & NatCash.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})} style={{background:"linear-gradient(135deg,#D4AF37,#8B7415)",border:"none",borderRadius:14,padding:"14px 32px",color:"#0A0A0A",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 8px 28px rgba(212,175,55,.35)",transition:"all .2s"}}>
              🛍️ Voir la collection
            </button>
            <button onClick={()=>window.open(`https://wa.me/${WA_NUM}`,"_blank")} style={{background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.3)",borderRadius:14,padding:"14px 28px",color:"#25D366",fontWeight:800,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
              <WAIcon size={20} color="#25D366"/> Commander
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION ACCUEIL HORIZONTALE — scroll produits par catégorie ── */}
      <section style={{padding:"10px 0 40px"}}>
        {["Vêtements","Accessoires","Tech"].map(cat=>{
          const catProds = products.filter(p=>p.active&&p.cat===cat);
          if(!catProds.length) return null;
          return(
            <div key={cat} style={{marginBottom:40}}>
              {/* Header catégorie */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 24px",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:22}}>{cat==="Vêtements"?"👗":cat==="Accessoires"?"👜":"📱"}</span>
                  <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#E8E0D0",letterSpacing:.5}}>{cat}</h2>
                  <span style={{background:"rgba(212,175,55,.1)",color:"#D4AF37",fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,border:"1px solid rgba(212,175,55,.2)"}}>{catProds.length} articles</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#334155"}}>← Faites défiler →</span>
                  <button onClick={()=>setCatFilter(cat)} style={{background:"transparent",border:"1px solid rgba(212,175,55,.25)",borderRadius:20,padding:"5px 14px",color:"#D4AF37",fontSize:11,fontWeight:700,cursor:"pointer"}}>Voir tout</button>
                </div>
              </div>

              {/* Scroll horizontal */}
              <div className="hscroll" style={{display:"flex",gap:16,overflowX:"auto",paddingLeft:24,paddingRight:24,paddingBottom:8,scrollSnapType:"x mandatory"}}>
                {catProds.map(p=>{
                  const d=p.old?Math.round((1-p.price/p.old)*100):null;
                  return(
                    <div key={p.id} className="prod-card" onClick={()=>setProdModal(p)} style={{minWidth:200,maxWidth:200,flexShrink:0,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:18,overflow:"hidden",cursor:"pointer",scrollSnapAlign:"start",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
                      <div style={{height:130,background:"linear-gradient(135deg,rgba(212,175,55,.05),rgba(255,255,255,.02))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:62,position:"relative"}}>
                        {p.emoji}
                        {d&&<span style={{position:"absolute",top:10,right:10,background:"rgba(239,68,68,.9)",color:"#fff",fontSize:10,fontWeight:900,padding:"2px 8px",borderRadius:20}}>-{d}%</span>}
                        {p.tag&&<span style={{position:"absolute",top:10,left:10,background:p.tag.includes("🇭🇹")?"rgba(6,78,59,.9)":p.tag.includes("⚡")?"rgba(55,48,163,.9)":"rgba(153,27,27,.9)",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20}}>{p.tag}</span>}
                      </div>
                      <div style={{padding:"12px 14px"}}>
                        <p style={{fontWeight:700,fontSize:13,color:"#E8E0D0",marginBottom:4,lineHeight:1.3}}>{p.name}</p>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                          <span style={{fontWeight:900,color:"#D4AF37",fontSize:16}}>{fmt(p.price)}</span>
                          {p.old&&<span style={{fontSize:11,color:"#334155",textDecoration:"line-through"}}>{fmt(p.old)}</span>}
                        </div>
                        <button onClick={e=>{e.stopPropagation();addCart(p)}} style={{width:"100%",padding:"9px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:12,cursor:"pointer",boxShadow:"0 3px 12px rgba(212,175,55,.25)"}}>
                          + Ajouter
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── CATALOGUE COMPLET (scroll vertical) ── */}
      <section id="shop" style={{padding:"20px 24px 60px",borderTop:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:"#E8E0D0",letterSpacing:.5,marginBottom:8}}>Collection complète</h2>
            <p style={{color:"#475569",fontSize:14}}>{filteredProds.length} article{filteredProds.length>1?"s":""} disponible{filteredProds.length>1?"s":""}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:18}}>
            {filteredProds.map(p=>{
              const d=p.old?Math.round((1-p.price/p.old)*100):null;
              return(
                <div key={p.id} className="prod-card" onClick={()=>setProdModal(p)} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:18,overflow:"hidden",cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
                  <div style={{height:150,background:"linear-gradient(135deg,rgba(212,175,55,.05),rgba(255,255,255,.02))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,position:"relative"}}>
                    {p.emoji}
                    {d&&<span style={{position:"absolute",top:12,right:12,background:"rgba(239,68,68,.9)",color:"#fff",fontSize:11,fontWeight:900,padding:"3px 9px",borderRadius:20}}>-{d}%</span>}
                    {p.tag&&<span style={{position:"absolute",top:12,left:12,background:p.tag.includes("🇭🇹")?"rgba(6,78,59,.9)":p.tag.includes("⚡")?"rgba(55,48,163,.9)":"rgba(153,27,27,.9)",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:20}}>{p.tag}</span>}
                  </div>
                  <div style={{padding:"14px 16px"}}>
                    <p style={{fontSize:11,color:"#475569",marginBottom:4,fontWeight:600}}>{p.cat}</p>
                    <p style={{fontWeight:700,fontSize:14,color:"#E8E0D0",marginBottom:6,lineHeight:1.3}}>{p.name}</p>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <span style={{fontWeight:900,color:"#D4AF37",fontSize:18}}>{fmt(p.price)}</span>
                      {p.old&&<span style={{fontSize:12,color:"#334155",textDecoration:"line-through"}}>{fmt(p.old)}</span>}
                    </div>
                    <button onClick={e=>{e.stopPropagation();addCart(p)}} style={{width:"100%",padding:"10px 0",borderRadius:11,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:"0 4px 14px rgba(212,175,55,.25)"}}>
                      + Ajouter au panier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION INFOS ── */}
      <section style={{background:"rgba(212,175,55,.04)",borderTop:"1px solid rgba(212,175,55,.08)",borderBottom:"1px solid rgba(212,175,55,.08)",padding:"50px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:24}}>
          {[
            {icon:"🚀",title:"Livraison rapide",desc:"Port-au-Prince même jour. Province sous 48h."},
            {icon:"💳",title:"Paiement facile",desc:"MonCash, NatCash ou cash à la livraison."},
            {icon:"🔒",title:"100% sécurisé",desc:"Votre commande est confirmée par WhatsApp."},
            {icon:"🇭🇹",title:"Fait pour Haïti",desc:"Service pensé pour le marché haïtien."},
          ].map(card=>(
            <div key={card.title} style={{textAlign:"center",padding:"24px 16px"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"}}>
              <div style={{fontSize:40,marginBottom:14}}>{card.icon}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"#D4AF37",marginBottom:8}}>{card.title}</h3>
              <p style={{color:"#475569",fontSize:13,lineHeight:1.7}}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT MODAL ── */}
      {prodModal&&(
        <>
          <div onClick={()=>setProdModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:300,backdropFilter:"blur(12px)"}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:480,maxWidth:"94vw",zIndex:301,background:"linear-gradient(145deg,#0F0C08,#080604)",border:"1px solid rgba(212,175,55,.2)",borderRadius:22,overflow:"hidden",boxShadow:"0 30px 80px rgba(0,0,0,.8),0 0 50px rgba(212,175,55,.06)",maxHeight:"90vh",overflowY:"auto"}}>
            <button onClick={()=>setProdModal(null)} style={{position:"absolute",top:16,right:16,zIndex:1,background:"rgba(255,255,255,.06)",border:"none",borderRadius:9,width:34,height:34,color:"#94A3B8",cursor:"pointer",fontSize:15,fontWeight:700}}>✕</button>
            <div style={{height:180,background:"linear-gradient(135deg,rgba(212,175,55,.08),rgba(255,255,255,.02))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:100}}>
              {prodModal.emoji}
            </div>
            <div style={{padding:"24px 28px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                <div>
                  <p style={{fontSize:12,color:"#D4AF37",fontWeight:700,marginBottom:4,letterSpacing:.5,textTransform:"uppercase"}}>{prodModal.cat}</p>
                  <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:"#E8E0D0"}}>{prodModal.name}</h2>
                </div>
                {prodModal.tag&&<span style={{background:prodModal.tag.includes("🇭🇹")?"rgba(6,78,59,.5)":prodModal.tag.includes("⚡")?"rgba(55,48,163,.5)":"rgba(153,27,27,.5)",color:"#fff",fontSize:11,fontWeight:800,padding:"4px 12px",borderRadius:20}}>{prodModal.tag}</span>}
              </div>
              <p style={{color:"#475569",fontSize:14,lineHeight:1.7,marginBottom:18}}>{prodModal.desc||"Produit premium de qualité. Livraison partout en Haïti."}</p>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
                <span style={{fontSize:28,fontWeight:900,color:"#D4AF37"}}>{fmt(prodModal.price)}</span>
                {prodModal.old&&<span style={{fontSize:16,color:"#334155",textDecoration:"line-through"}}>{fmt(prodModal.old)}</span>}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{addCart(prodModal);setProdModal(null)}} style={{flex:1,padding:"13px",borderRadius:12,border:"1px solid rgba(212,175,55,.4)",background:"transparent",color:"#D4AF37",fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Panier</button>
                <button onClick={()=>{addCart(prodModal);setProdModal(null);setCartOpen(true)}} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 4px 18px rgba(212,175,55,.3)"}}>🛒 Commander maintenant</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PANIER DRAWER ── */}
      {cartOpen&&(
        <>
          <div onClick={()=>setCartOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,backdropFilter:"blur(8px)"}}/>
          <div style={{position:"fixed",right:0,top:0,bottom:0,width:400,maxWidth:"95vw",background:"linear-gradient(180deg,#0F0C08,#080604)",border:"1px solid rgba(212,175,55,.1)",borderRight:"none",zIndex:201,display:"flex",flexDirection:"column",animation:"slideR .3s ease",boxShadow:"-16px 0 60px rgba(0,0,0,.6)"}}>
            <div style={{padding:"20px 22px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(212,175,55,.04)"}}>
              <div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:20,color:"#D4AF37",letterSpacing:.5}}>Mon Panier</h2>
                <p style={{color:"#475569",fontSize:12,marginTop:2}}>{cartCount} article{cartCount>1?"s":""}</p>
              </div>
              <button onClick={()=>setCartOpen(false)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",borderRadius:9,width:36,height:36,color:"#94A3B8",cursor:"pointer",fontSize:16,fontWeight:700}}>✕</button>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"14px 22px"}}>
              {cart.length===0?(
                <div style={{textAlign:"center",paddingTop:80,color:"#334155"}}>
                  <div style={{fontSize:56,marginBottom:14}}>🛒</div>
                  <p style={{fontSize:14}}>Votre panier est vide</p>
                </div>
              ):cart.map(item=>(
                <div key={item.id} style={{display:"flex",gap:12,padding:"13px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{fontSize:34,background:"rgba(212,175,55,.06)",borderRadius:11,width:54,height:54,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(212,175,55,.12)",flexShrink:0}}>{item.emoji}</div>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:13,marginBottom:2,color:"#E8E0D0"}}>{item.name}</p>
                    <p style={{fontWeight:900,color:"#D4AF37",fontSize:14,marginBottom:7}}>{fmt(item.price)}</p>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <button onClick={()=>updQty(item.id,-1)} style={{width:26,height:26,borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.03)",color:"#94A3B8",cursor:"pointer",fontWeight:700}}>−</button>
                      <span style={{fontWeight:800,minWidth:18,textAlign:"center",fontSize:14}}>{item.qty}</span>
                      <button onClick={()=>updQty(item.id,1)} style={{width:26,height:26,borderRadius:7,border:"1px solid rgba(212,175,55,.3)",background:"rgba(212,175,55,.08)",color:"#D4AF37",cursor:"pointer",fontWeight:700}}>+</button>
                      <button onClick={()=>delItem(item.id)} style={{marginLeft:"auto",color:"#EF4444",background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600}}>Retirer</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length>0&&(
              <div style={{padding:"18px 22px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <input value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder="Code promo (VAULT10)" style={{flex:1,padding:"8px 12px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:9,color:"#E8E0D0",fontSize:12}}/>
                  <button onClick={()=>{if(promoCode.toUpperCase()==="VAULT10"){setPromoOk(true);toast$("🎉 -10% appliqué !");}else toast$("Code invalide","err");}} style={{padding:"8px 12px",borderRadius:9,border:"none",background:"rgba(212,175,55,.12)",color:"#D4AF37",fontWeight:700,fontSize:12,cursor:"pointer"}}>OK</button>
                </div>
                <div style={{fontSize:12,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",color:"#64748B",marginBottom:5}}><span>Sous-total</span><span style={{color:"#E8E0D0",fontWeight:700}}>{fmt(cartTotal)}</span></div>
                  {promoOk&&<div style={{display:"flex",justifyContent:"space-between",color:"#4ADE80",marginBottom:5}}><span>Code VAULT10</span><span>−{fmt(discount)}</span></div>}
                </div>
                <button onClick={()=>{setCartOpen(false);setCheckout(true)}} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:900,fontSize:15,cursor:"pointer",boxShadow:"0 6px 22px rgba(212,175,55,.3)"}}>
                  Passer la commande →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── CHECKOUT MODAL ── */}
      {checkout&&(
        <>
          <div onClick={()=>setCheckout(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:300,backdropFilter:"blur(10px)"}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:480,maxWidth:"94vw",zIndex:301,background:"linear-gradient(145deg,#0F0C08,#080604)",border:"1px solid rgba(212,175,55,.2)",borderRadius:22,boxShadow:"0 30px 80px rgba(0,0,0,.8)",maxHeight:"90vh",overflowY:"auto",animation:"slideUp .35s ease"}}>
            <div style={{padding:"20px 26px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:20,color:"#D4AF37",letterSpacing:.5}}>📦 Finaliser la commande</h2>
              <button onClick={()=>setCheckout(false)} style={{background:"rgba(255,255,255,.05)",border:"none",borderRadius:8,width:32,height:32,color:"#94A3B8",cursor:"pointer",fontSize:14,fontWeight:700}}>✕</button>
            </div>
            <div style={{padding:"22px 26px"}}>
              {[{l:"Nom complet",k:"name",ph:"Jean Pierre",t:"text"},{l:"Numéro WhatsApp",k:"phone",ph:"+509 XX XX XX XX",t:"tel"},{l:"Adresse livraison",k:"addr",ph:"Rue, numéro, quartier...",t:"text"}].map(f=>(
                <div key={f.k} style={{marginBottom:14}}>
                  <label style={{fontSize:11,color:"#64748B",display:"block",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{f.l}</label>
                  <input type={f.t} placeholder={f.ph} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,color:"#E8E0D0",fontSize:13,transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor="rgba(212,175,55,.4)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.07)"}/>
                </div>
              ))}
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,color:"#64748B",display:"block",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Zone de livraison</label>
                <select value={form.zone} onChange={e=>setForm(p=>({...p,zone:e.target.value}))} style={{width:"100%",padding:"11px 14px",background:"rgba(10,8,6,.95)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,color:"#E8E0D0",fontSize:13}}>
                  {zones.map(z=><option key={z.name} value={z.name} style={{background:"#0F0C08"}}>{z.name} — {fmt(z.frais)} · {z.delai}</option>)}
                </select>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:11,color:"#64748B",display:"block",marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Paiement</label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[["MonCash","📱"],["NatCash","💳"],["Cash","💵"]].map(([m,ic])=>(
                    <button key={m} onClick={()=>setForm(p=>({...p,pay:m}))} style={{padding:"10px 6px",borderRadius:9,fontWeight:700,fontSize:12,border:`1px solid ${form.pay===m?"rgba(212,175,55,.5)":"rgba(255,255,255,.07)"}`,background:form.pay===m?"rgba(212,175,55,.15)":"rgba(255,255,255,.02)",color:form.pay===m?"#D4AF37":"#475569",cursor:"pointer",transition:"all .2s"}}>{ic} {m}</button>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div style={{background:"rgba(212,175,55,.05)",border:"1px solid rgba(212,175,55,.15)",borderRadius:12,padding:"14px",marginBottom:18}}>
                {cart.map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:5}}><span>{i.emoji} {i.name} ×{i.qty}</span><span style={{color:"#E8E0D0",fontWeight:600}}>{fmt(i.price*i.qty)}</span></div>)}
                {promoOk&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#4ADE80",marginBottom:5}}><span>Code promo</span><span>−{fmt(discount)}</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:10}}><span>Livraison · {form.zone}</span><span style={{color:"#E8E0D0",fontWeight:600}}>{fmt(delivery)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:18,borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:10}}><span>Total</span><span style={{color:"#D4AF37"}}>{fmt(cartTotal-discount+delivery)}</span></div>
              </div>

              {/* ✅ BOUTON COMMANDER — client reste sur le site */}
              <button onClick={placeOrder} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:"linear-gradient(135deg,#D4AF37,#8B7415)",color:"#0A0A0A",fontWeight:900,fontSize:15,cursor:"pointer",boxShadow:"0 8px 28px rgba(212,175,55,.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                ✅ Confirmer ma commande
              </button>
              <p style={{textAlign:"center",fontSize:11,color:"#334155",marginTop:10}}>Notre équipe vous contactera sur WhatsApp sous 30 min 🇭🇹</p>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer style={{background:"#060504",borderTop:"1px solid rgba(212,175,55,.06)",padding:"40px 24px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:32,marginBottom:32}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:20}}>🏛️</span>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:18,color:"#D4AF37",letterSpacing:1}}>VAULT STORE</span>
              </div>
              <p style={{color:"#334155",fontSize:13,lineHeight:1.8,marginBottom:16}}>Élégance à votre porte. Vêtements, accessoires et tech premium livrés partout en Haïti.</p>
              <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#25D366,#128C7E)",color:"#fff",padding:"9px 18px",borderRadius:10,textDecoration:"none",fontWeight:700,fontSize:13,boxShadow:"0 4px 14px rgba(37,211,102,.25)",animation:"waPulse 3s ease infinite"}}>
                <WAIcon size={16}/> WhatsApp
              </a>
            </div>
            <div>
              <h4 style={{color:"#D4AF37",fontWeight:700,fontSize:12,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Catégories</h4>
              {["Vêtements","Accessoires","Tech"].map(c=><p key={c} onClick={()=>{setCatFilter(c);window.scrollTo({top:0,behavior:"smooth"})}} style={{color:"#475569",fontSize:13,marginBottom:9,cursor:"pointer"}}>{c==="Vêtements"?"👗":c==="Accessoires"?"👜":"📱"} {c}</p>)}
            </div>
            <div>
              <h4 style={{color:"#D4AF37",fontWeight:700,fontSize:12,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Zones livrées</h4>
              {["Port-au-Prince","Cap-Haïtien","Gonaïves","Jacmel","Les Cayes"].map(z=><p key={z} style={{color:"#475569",fontSize:13,marginBottom:7}}>📍 {z}</p>)}
            </div>
            <div>
              <h4 style={{color:"#D4AF37",fontWeight:700,fontSize:12,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Paiements</h4>
              {[["📱","MonCash"],["💳","NatCash"],["💵","Cash livraison"]].map(([ic,n])=>(
                <div key={n} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:8,padding:"8px 12px",marginBottom:8}}>
                  <span style={{fontSize:18}}>{ic}</span>
                  <span style={{color:"#475569",fontSize:12,fontWeight:600}}>{n}</span>
                  <span style={{marginLeft:"auto",color:"#4ADE80",fontSize:9,fontWeight:700}}>● Actif</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.04)",paddingTop:20,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <p style={{color:"#1E293B",fontSize:12}}>© 2026 Vault Store · Fait avec ❤️ pour Haïti 🇭🇹</p>
            <p style={{color:"#1E293B",fontSize:12}}>"Élégance à votre porte."</p>
          </div>
        </div>
      </footer>

      {/* Bouton WA flottant */}
      <a href={`https://wa.me/${WA_NUM}?text=Bonjour Vault Store 🇭🇹 Je voudrais commander !`} target="_blank" rel="noreferrer" style={{position:"fixed",bottom:26,right:26,zIndex:99,width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#25D366,#128C7E)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",boxShadow:"0 6px 24px rgba(37,211,102,.5)",animation:"waPulse 2.5s ease infinite"}}>
        <WAIcon size={28}/>
      </a>
    </div>
  );
}
