const form = document.getElementById("authForm");
const modeButtons = document.querySelectorAll(".tab");
const nameGroup = document.getElementById("nameGroup");
const confirmGroup = document.getElementById("confirmGroup");
const termsGroup = document.getElementById("termsGroup");
const termsError = document.getElementById("termsError");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("status");
const password = document.getElementById("password");
const confirm = document.getElementById("confirm");
let mode = "signup";

function setMode(newMode){
  mode = newMode;
  modeButtons.forEach(b=>b.classList.toggle("active", b.dataset.mode===mode));
  const signup = mode==="signup";
  nameGroup.classList.toggle("hidden", !signup);
  confirmGroup.classList.toggle("hidden", !signup);
  termsGroup.classList.toggle("hidden", !signup);
  termsError.textContent="";
  submitBtn.textContent = signup ? "Create secure account" : "Sign in securely";
  statusBox.className="status";
  form.reset();
  clearValidation();
  updateStrength();
}

modeButtons.forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));

function setField(input, valid, message){
  const group=input.closest(".field");
  group.classList.toggle("valid", valid);
  group.classList.toggle("invalid", !valid);
  group.querySelector(".error").textContent=valid?"":message;
}
function clearValidation(){
  document.querySelectorAll(".field").forEach(g=>g.classList.remove("valid","invalid"));
  document.querySelectorAll(".field .error").forEach(e=>e.textContent="");
}
function validateEmail(value){
  if(!value) return "Email is required.";
  if(value.length>254) return "Email is too long.";
  if(/\s/.test(value)) return "Email cannot contain spaces.";
  const ok=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  return ok ? "" : "Enter a valid email address.";
}
function passwordRules(value){
  return {
    length:value.length>=8 && value.length<=72,
    upper:/[A-Z]/.test(value),
    lower:/[a-z]/.test(value),
    number:/\d/.test(value),
    symbol:/[^A-Za-z0-9]/.test(value)
  };
}
function passwordError(value){
  if(!value) return "Password is required.";
  const r=passwordRules(value);
  const missing=Object.entries(r).filter(([,v])=>!v).map(([k])=>k);
  if(missing.length) return "Password does not meet all strength requirements.";
  if(/password|12345678|qwerty|letmein/i.test(value)) return "Avoid common passwords or patterns.";
  return "";
}
function updateStrength(){
  const value=password.value, r=passwordRules(value);
  Object.entries(r).forEach(([key,pass])=>{
    document.querySelector(`[data-rule="${key}"]`).classList.toggle("pass",pass);
  });
  const score=Object.values(r).filter(Boolean).length;
  const labels=["—","Very weak","Weak","Fair","Strong","Excellent"];
  document.getElementById("strengthText").textContent=`Strength: ${labels[score]}`;
  document.getElementById("scoreText").textContent=`${score}/5`;
  document.getElementById("meterBar").style.width=`${score*20}%`;
  document.getElementById("meterBar").style.background=score<=2?"#ff647c":score===3?"#ffd166":"#42e695";
}
function validateLive(){
  const email=document.getElementById("email");
  const e=validateEmail(email.value);
  setField(email,!e,e);
  if(mode==="signup"){
    const name=document.getElementById("name");
    const nv=name.value.trim();
    const ne=nv.length>=2&&nv.length<=60?/^[A-Za-zÀ-ÿ.' -]+$/.test(nv)?"":"Use letters, spaces, apostrophes, dots or hyphens.":"Name must be 2–60 characters.";
    setField(name,!ne,ne);
  }
  const pe=passwordError(password.value);
  setField(password,!pe,pe);
  if(mode==="signup"){
    const ce=confirm.value===password.value && confirm.value ? "" : "Passwords do not match.";
    setField(confirm,!ce,ce);
  }
  updateStrength();
}
["name","email","password","confirm"].forEach(id=>{
  document.getElementById(id).addEventListener("input",validateLive);
});
function toggle(input,button){
  input.type=input.type==="password"?"text":"password";
  button.textContent=input.type==="password"?"Show":"Hide";
}
document.getElementById("togglePassword").addEventListener("click",e=>toggle(password,e.currentTarget));
document.getElementById("toggleConfirm").addEventListener("click",e=>toggle(confirm,e.currentTarget));

form.addEventListener("submit",e=>{
  e.preventDefault(); validateLive();
  let valid=true;
  if(validateEmail(document.getElementById("email").value)) valid=false;
  if(passwordError(password.value)) valid=false;
  if(mode==="signup"){
    const n=document.getElementById("name").value.trim();
    if(n.length<2 || n.length>60 || !/^[A-Za-zÀ-ÿ.' -]+$/.test(n)) valid=false;
    if(confirm.value!==password.value || !confirm.value) valid=false;
    if(!document.getElementById("terms").checked){
      termsError.textContent="Please accept the terms to continue.";
      valid=false;
    } else termsError.textContent="";
  }
  statusBox.className=`status show ${valid?"good":"bad"}`;
  statusBox.textContent=valid
    ? (mode==="signup" ? "✓ Validation passed. Demo account creation is ready; no data was sent anywhere." : "✓ Validation passed. Demo sign-in is ready; no data was sent anywhere.")
    : "Please fix the highlighted fields before continuing.";
  if(valid) statusBox.scrollIntoView({behavior:"smooth",block:"nearest"});
});

setMode("signup");
