// Shared Cardify data and localStorage functions. Educational demo only.
const K={users:"cardify_users",cards:"cardify_cards",session:"cardify_session"};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
let users=read(K.users,null),cards=read(K.cards,[]);
if(!users){users=[{id:"admin-1",name:"Cardify Admin",email:"admin@cardify.demo",password:"Admin123!",role:"admin",active:true}];localStorage.setItem(K.users,JSON.stringify(users))}
if(!localStorage.getItem(K.cards))localStorage.setItem(K.cards,"[]");
users=read(K.users,users);cards=read(K.cards,[]);
function saveUsers(){localStorage.setItem(K.users,JSON.stringify(users))}
function saveCards(){localStorage.setItem(K.cards,JSON.stringify(cards))}
function getCurrentUser(){return read(K.session,null)}
function setCurrentUser(u){u?localStorage.setItem(K.session,JSON.stringify({id:u.id,name:u.name,email:u.email,role:u.role})):localStorage.removeItem(K.session)}
function addCard(d){let id=cards.reduce((m,c)=>Math.max(m,+c.id||0),0)+1;let c={id,...d,status:d.status||"pending",ownerId:d.ownerId||getCurrentUser()?.id,createdAt:new Date().toISOString(),reviewNote:""};cards.push(c);saveCards();return c}
function deleteCard(id){let n=cards.length;cards=cards.filter(c=>+c.id!==+id);if(n!==cards.length)saveCards();return n!==cards.length}
function searchCards(q,source=cards){q=String(q||"").toLowerCase().trim();return source.filter(c=>!q||`${c.name} ${c.company} ${c.title}`.toLowerCase().includes(q))}
function countByStatus(s,source=cards){return source.filter(c=>c.status===s).length}
function updateStatus(id,status,note=""){if(!["draft","pending","approved","rejected"].includes(status))return false;let c=cards.find(c=>+c.id===+id);if(!c)return false;c.status=status;c.reviewNote=note;saveCards();return true}
function editCard(id,changes){let c=cards.find(c=>+c.id===+id);if(!c)return false;["name","title","company","email","phone","website","location","template","color"].forEach(k=>{if(k in changes)c[k]=changes[k]});saveCards();return true}
function registerUser(d){let email=d.email.trim().toLowerCase();if(users.some(u=>u.email.toLowerCase()===email))return{ok:false,message:"This email is already registered."};let u={id:"u"+Date.now(),name:d.name.trim(),email,password:d.password,phone:d.phone,role:"user",active:true};users.push(u);saveUsers();return{ok:true,user:u}}
function loginUser(email,password){let u=users.find(u=>u.email.toLowerCase()===email.trim().toLowerCase()&&u.password===password);if(!u)return{ok:false,message:"Incorrect email or password."};if(!u.active)return{ok:false,message:"This account is inactive."};setCurrentUser(u);return{ok:true,user:u}}
function logoutUser(){setCurrentUser(null)}
function setUserActive(id,active){let u=users.find(u=>u.id===id&&u.role!=="admin");if(!u)return false;u.active=active;saveUsers();return true}
