
window.user = JSON.parse(localStorage.getItem('user'))

if  (window.user != null){
  var opPerfil = document.createElement('li')
  var perfil = document.createElement('a')
  perfil.href = `/user/${window.user.nickname}`
  perfil.innerHTML = window.user.displayName.split(' ')[0] || window.user.nickname
  opPerfil.appendChild(perfil)

  var menu = document.getElementById('menu').getElementsByTagName('ul')

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
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location = "/";
    })
  }
}

function cerrarSesion(event){
  localStorage.removeItem('token')
  localStorage.removeItem('id')
  localStorage.removeItem('user')
}


function dateToString(fecha) {
  var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  var date = new Date(fecha);
  var dateString = date.getDate()+"/"+meses[date.getMonth()]+"/"+date.getFullYear();

  return dateString;
}

function dateToStringWithHour(fecha) {
  var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  var date = new Date(fecha);
  var dateString = date.getDate()+"/"+meses[date.getMonth()]+"/"+date.getFullYear()+" "+pad(date.getHours().toString(), 2)+":"+pad(date.getMinutes().toString(), 2);

  return dateString;
}


function replaceAllDateFormats() {
  var fechas = document.getElementsByTagName('time');

  for (var i=0; i<fechas.length; i++){
    if (fechas[i].className == "large"){
      fechas[i].innerHTML = dateToStringWithHour(fechas[i].innerHTML);
    } else {
      fechas[i].innerHTML = dateToString(fechas[i].innerHTML);
    }
  }
}

function pad (str, max) {
  return str.length < max ? pad("0" + str, max) : str;
}


function calcularEdad(fecha)
{
  // Si la fecha es correcta, calculamos la edad
  var values= new Date(fecha);
  var dia = values.getDate();
  var mes = values.getMonth()+1;
  var ano = values.getFullYear();

  // cogemos los valores actuales
  var fecha_hoy = new Date();
  var ahora_dia = fecha_hoy.getDate();
  var ahora_mes = fecha_hoy.getMonth()+1;
  var ahora_ano = fecha_hoy.getFullYear();

  // realizamos el calculo
  var edad = ahora_ano - ano;
  if ( ahora_mes < mes )
  {
    edad--;
  }
  if ((mes == ahora_mes) && (ahora_dia < dia))
  {
    edad--;
  }
  if (edad > 1900)
  {
    edad -= 1900;
  }

  // calculamos los meses
  var meses=0;
  if(ahora_mes>mes)
  meses=ahora_mes-mes;
  if(ahora_mes<mes)
  meses=12-(mes-ahora_mes);
  if(ahora_mes==mes && dia>ahora_dia)
  meses=11;

  // calculamos los dias
  var dias=0;
  if(ahora_dia>dia)
  dias=ahora_dia-dia;
  if(ahora_dia<dia)
  {
    ultimoDiaMes=new Date(ahora_ano, ahora_mes, 0);
    dias=ultimoDiaMes.getDate()-(dia-ahora_dia);
  }

  return edad;
}



function getURLParameters(paramName)
{
    var sURL = window.document.URL.toString();
    if (sURL.indexOf("?") > 0)
    {
        var arrParams = sURL.split("?");
        var arrURLParams = arrParams[1].split("&");
        var arrParamNames = new Array(arrURLParams.length);
        var arrParamValues = new Array(arrURLParams.length);

        var i = 0;
        for (i = 0; i<arrURLParams.length; i++)
        {
            var sParam =  arrURLParams[i].split("=");
            arrParamNames[i] = sParam[0];
            if (sParam[1] != "")
                arrParamValues[i] = unescape(sParam[1]);
            else
                arrParamValues[i] = "No Value";
        }

        for (i=0; i<arrURLParams.length; i++)
        {
            if (arrParamNames[i] == paramName)
            {
                //alert("Parameter:" + arrParamValues[i]);
                return arrParamValues[i];
            }
        }
        return "No Parameters Found";
    }
}
