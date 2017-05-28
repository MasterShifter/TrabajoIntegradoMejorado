
window.user = JSON.parse(localStorage.getItem('user'))

if  (window.user != null){
var opPerfil = document.createElement('li')
var perfil = document.createElement('a')
perfil.href = `user/${window.user.nickname}`
perfil.innerHTML = window.user.displayName || window.user.nickname
opPerfil.appendChild(perfil)

var opMensajes = document.createElement('li')
var mensajes = document.createElement('a')
mensajes.href = `mail`
mensajes.innerHTML = 'Mensajes'
opMensajes.appendChild(mensajes)

var menu = document.getElementById('menu').getElementsByTagName('ul')

menu[0].insertBefore(opMensajes, menu[0].getElementsByTagName('li')[0])
menu[0].insertBefore(opPerfil, menu[0].getElementsByTagName('li')[0])

menu[1].getElementsByTagName('span')[1].innerHTML = 'Cerrar sesión'
menu[1].getElementsByTagName('a')[0].href = '/'
menu[1].getElementsByTagName('a')[0].onclick = cerrarSesion
}



function retrieveUser(event){
  if (localStorage.getItem('token') != null){
    fetch(`/api/user/${localStorage.id}`, {
      method: 'GET',
      headers: new Headers()
    })
    .then(res => res.json())
    .then(data => {
      localStorage.setItem('user', JSON.stringify(data.user))
    })
  }
}

function cerrarSesion(event){
  localStorage.removeItem('token')
  localStorage.removeItem('id')
  localStorage.removeItem('user')
}
