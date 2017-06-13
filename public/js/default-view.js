window.user = JSON.parse(localStorage.getItem('user'));

if  (window.user != null){
  var opPerfil = document.createElement('li');
  var perfil = document.createElement('a');
  perfil.href = `/user/${window.user.nickname}`;
  perfil.innerHTML = window.user.displayName.substring(0, 15) || window.user.nickname;
  opPerfil.appendChild(perfil);

  var menu = document.getElementById('menu').getElementsByTagName('ul');

  menu[0].insertBefore(opPerfil, menu[0].getElementsByTagName('li')[0]);

  menu[1].getElementsByTagName('span')[1].innerHTML = 'Cerrar sesión';
  menu[1].getElementsByTagName('a')[0].href = '/closesion';
  menu[1].getElementsByTagName('a')[0].onclick = cerrarSesion;

  document.getElementById('register').className = "hide";
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
  event.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('id');
  localStorage.removeItem('user');
  window.location = window.location;
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


function calcularEdad(date)
{
  // Si la fecha es correcta, calculamos la edad
  var values= new Date(date);
  var day = values.getDate();
  var month = values.getMonth()+1;
  var year = values.getFullYear();

  // cogemos los valores actuales
  var today = new Date();
  var today_day = today.getDate();
  var today_month = today.getMonth()+1;
  var today_year = today.getFullYear();

  // realizamos el calculo
  var age = today_year - year;
  if ( today_month < month )
  {
    age--;
  }
  if ((month == today_month) && (today_day < day))
  {
    age--;
  }
  if (age > 1900)
  {
    age -= 1900;
  }

  // calculamos los meses
  var months=0;
  if(today_month>month)
  months=today_month-month;
  if(today_month<month)
  months=12-(month-today_month);
  if(today_month==month && day>today_day)
  months=11;

  // calculamos los dias
  var days=0;
  if(today_day>day)
  days=today_day-day;
  if(today_day<day)
  {
    lastMonthDay=new Date(today_year, today_month, 0);
    days=lastMonthDay.getDate()-(day-today_day);
  }

  return age;
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
                return arrParamValues[i];
            }
        }
        return "No Parameters Found";
    }
}
