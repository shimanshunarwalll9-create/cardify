// Cardify page behaviour
document.addEventListener("DOMContentLoaded",()=>{
 const page=location.pathname.split("/").pop()||"index.html",me=getCurrentUser();
 const msg=(id,text)=>{let e=document.getElementById(id);if(e)e.textContent=text};
 const protectedPage=["dashboard.html","create-card.html","admin.html"].includes(page);
 if(protectedPage&&!me){location.href="login.html";return}
 if(me&&!users.some(u=>u.id===me.id&&u.active)){logoutUser();location.href="login.html";return}
 if(page==="admin.html"&&me.role!=="admin"){location.href="dashboard.html";return}
 document.querySelectorAll("[data-logout]").forEach(b=>b.addEventListener("click",()=>{logoutUser();location.href="index.html"}));
 const rf=document.getElementById("registerForm");
 if(rf)rf.addEventListener("submit",e=>{e.preventDefault();let p=document.getElementById("registerPassword").value,cp=document.getElementById("confirmPassword").value;if(p.length<8)return msg("registerMessage","Password must be at least 8 characters.");if(p!==cp)return msg("registerMessage","Passwords do not match.");let r=registerUser({name:document.getElementById("fullName").value,email:document.getElementById("registerEmail").value,phone:document.getElementById("registerPhone").value,password:p});if(!r.ok)return msg("registerMessage",r.message);setCurrentUser(r.user);location.href="dashboard.html"});
 const lf=document.getElementById("loginForm");
 if(lf)lf.addEventListener("submit",e=>{e.preventDefault();let r=loginUser(document.getElementById("loginEmail").value,document.getElementById("loginPassword").value);if(!r.ok)return msg("loginMessage",r.message);location.href=r.user.role==="admin"?"admin.html":"dashboard.html"});
 const cf=document.getElementById("cardForm");
 if(cf){
  let editId=new URLSearchParams(location.search).get("edit"),old=editId?cards.find(c=>+c.id===+editId):null;
  if(editId&&(!old||(old.ownerId!==me.id&&me.role!=="admin"))){location.href="dashboard.html";return}
  if(old){document.getElementById("formTitle").textContent="Edit business card";Object.keys(old).forEach(k=>{if(cf.elements[k])cf.elements[k].value=old[k]})}
  const ids=["previewName","previewTitle","previewCompany","previewEmail","previewPhone","previewWebsite","previewLocation","cardPreview"];
  const el=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));
  const preview=()=>{let val=k=>cf.elements[k]?.value||"";el.previewName.textContent=val("name")||"YOUR NAME";el.previewTitle.textContent=val("title")||"Job Title";el.previewCompany.textContent=val("company")||"Company";el.previewEmail.textContent="Email: "+(val("email")||"—");el.previewPhone.textContent="Phone: "+(val("phone")||"—");el.previewWebsite.textContent="Website: "+(val("website")||"—");el.previewLocation.textContent="Location: "+(val("location")||"—");el.cardPreview.className="business-card "+val("color")};
  cf.addEventListener("input",preview);cf.addEventListener("change",preview);preview();
  cf.addEventListener("submit",e=>{e.preventDefault();if(!cf.reportValidity())return;let d={};["name","title","company","email","phone","website","location","template","color"].forEach(k=>d[k]=cf.elements[k].value.trim());if(old){editCard(old.id,d);if(old.status==="rejected")updateStatus(old.id,"pending")}else addCard({...d,ownerId:me.id,status:"pending"});location.href="dashboard.html"});
 }
 const rows=document.getElementById("dashboardCards");
 if(rows){
  document.getElementById("welcomeText").textContent="Welcome, "+me.name+". Manage your cards.";
  const own=()=>cards.filter(c=>me.role==="admin"||c.ownerId===me.id);
  function render(){let list=own();document.getElementById("totalCards").textContent=list.length;document.getElementById("approvedCards").textContent=countByStatus("approved",list);document.getElementById("pendingCards").textContent=countByStatus("pending",list);document.getElementById("rejectedCards").textContent=countByStatus("rejected",list);let result=searchCards(document.getElementById("cardSearch").value,list).filter(c=>document.getElementById("statusFilter").value==="all"||c.status===document.getElementById("statusFilter").value);rows.innerHTML=result.length?result.map(c=>`<tr><td><b>${esc(c.name)}</b><small>${esc(c.title)}</small></td><td>${esc(c.company)}</td><td>${esc(c.template)}</td><td><span class="status ${c.status}">${c.status}</span></td><td><a class="table-action" href="create-card.html?edit=${c.id}">Edit</a> <button class="table-action danger" data-delete="${c.id}">Delete</button></td></tr>`).join(""):'<tr><td colspan="5" class="empty">No matching cards. Create your first card.</td></tr>'}
  rows.addEventListener("click",e=>{let b=e.target.closest("[data-delete]");if(!b)return;let c=cards.find(x=>+x.id===+b.dataset.delete);if(c&&(c.ownerId===me.id||me.role==="admin")&&confirm("Delete this card?")){deleteCard(c.id);render()}});document.getElementById("cardSearch").addEventListener("input",render);document.getElementById("statusFilter").addEventListener("change",render);render();
 }
 const queue=document.getElementById("adminReviewQueue");
 if(queue){document.getElementById("adminUsers").textContent=users.length;document.getElementById("activeUsers").textContent=users.filter(u=>u.active).length;document.getElementById("adminPending").textContent=countByStatus("pending");document.getElementById("adminCards").textContent=cards.length;let pending=cards.filter(c=>c.status==="pending");queue.innerHTML=pending.length?pending.map(c=>{let owner=users.find(u=>u.id===c.ownerId);return `<tr><td>${esc(owner?.name||"Unknown")}<small>${esc(c.name)}</small></td><td>${esc(c.company)}</td><td><span class="status pending">pending</span></td><td><button class="table-action" data-review="approved" data-id="${c.id}">Approve</button> <button class="table-action danger" data-review="rejected" data-id="${c.id}">Reject</button></td></tr>`}).join(""):'<tr><td colspan="4" class="empty">No pending submissions.</td></tr>';const userRows=document.getElementById("adminUserRows");userRows.innerHTML=users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td><td>${u.active?"Active":"Inactive"}</td><td>${u.role==="admin"?"—":`<button class="table-action" data-toggle="${u.id}">${u.active?"Deactivate":"Activate"}</button>`}</td></tr>`).join("");queue.addEventListener("click",e=>{let b=e.target.closest("[data-review]");if(!b)return;let note=b.dataset.review==="rejected"?(prompt("Optional rejection reason")||""):"";updateStatus(b.dataset.id,b.dataset.review,note);location.reload()});userRows.addEventListener("click",e=>{let b=e.target.closest("[data-toggle]");if(!b)return;let u=users.find(x=>x.id===b.dataset.toggle);if(u)setUserActive(u.id,!u.active);location.reload()})}
});
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
