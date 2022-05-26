
/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '760748803726-ulpki8trrvhp56hur5h9cjp4b0mns3ub.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCCFPlhSEMyJmbUvSsOCQEHntWwu0CZJAs';
const REDIRECT_URl = 'https://localhost:3000/src/vista/choose-user';
const BASE_URl = 'https://localhost:3000';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://classroom.googleapis.com/$discovery/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly https://www.googleapis.com/auth/classroom.coursework.students https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/classroom.rosters.readonly';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let userIDLogged = null;
let listCourse;
let buttonID;

//document.getElementById('authorize_button').style.visibility = 'hidden';
//document.getElementById('signout_button').style.visibility = 'hidden';
//document.getElementById('nextAttribute').style.visibility = 'hidden';
/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  var gapiRes = await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  
  });

   
   
  console.log("gapiRes:", gapiRes);
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '',
    
  });
  console.log("tokenClient:", tokenClient);
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  /* if (localStorage.getItem('tokenClient') !== null) {
    gapi.client.setToken(JSON.parse(localStorage.getItem('tokenClient')))
    gisInited = true;
    gapiInited = true;
  } */
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
    
  }

}



/**
 *  Sign in the user upon button click.
 */
let authButton = document.getElementById("authorize_button");


const handleAuthClick = e => {
   
  e.preventDefault();
  
  const profile = '';
  
  
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
      
    }
    localStorage.setItem('tokenClient', JSON.stringify(resp));

    //get the profile information
    profile = await gapi.client.classroom.userProfiles.get({
      userId: CLIENT_ID
    });

    console.log(profile);
    userIDLogged = profile.result.id;

  
  };


  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
    
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
    
  }
   
 
  
   
  
}

authButton.addEventListener( "click", handleAuthClick );


/**
 *  Sign out the user upon button click.
 */
 function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
    document.getElementById('nextAttribute').innerText = '';
    for (let index = 0; index < buttonID; index++)
      removeElement(index);
  }
  buttonID = 0;
}


/**
 * Print the names of the first 10 courses the user has access to. If
 * no courses are found an appropriate message is printed.
 */
 async function listCourses() {

  let response;
  try {
    response = await gapi.client.classroom.courses.list({
      pageSize: 10, courseStates: 1
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }

  const courses = response.result.courses;
  listCourse = response.result.courses;
  if (!courses || courses.length == 0) {
    document.getElementById('content').innerText = 'No courses found.';
    return;
  }

  buttonID = 0;
  var imageExample = "https://los40.cl/wp-content/uploads/2022/05/memes-lobos-1024x576.jpg";

  for (let index = 0; index < courses.length; index++) {

    //validate userIDLogged is the ownerId
    var typeUser = (userIDLogged == courses[index].ownerId) ? "Profesor" : "Estudiante";


    console.log(JSON.stringify(courses[index]));

   
    const div = document.createElement('div');
    div.id = index;
    div.className = ' col-sm-12 col-md-6 col-lg-4 col-xl-3 mb-2';
    div.innerHTML = `
    <div class="card">
      <div class="card-body">
        <img src="../assets/logo_large.png" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${typeUser + "-" + courses[index].name}</h5>
            <p class="card-text">${courses[index].description}</p> 
            <a href="#" class="btn btn-primary">Ir a clase</a>
          </div>
      </div>
    </div>`;

    document.getElementById('content').appendChild(div);
    div.onclick = async function () { getActivity(index, courses); }
    buttonID++;


  }

  console.log("listCourses:", buttonID);

}


async function getActivity(index, courses) {
  console.log("getActivity:", index);

  document.getElementById('nextAttribute').style.visibility = 'visible';
  const element = courses[index].id;
  try {
    activitiesList = await gapi.client.classroom.courses.courseWork.list({
      courseId: element, courseWorkStates: 1
    })
  }

  catch (err) {

    document.getElementById('nextAttribute').innerText = err.message;

  }

  //remove previous elements
  for (let index = 0; index < buttonID; index++) {
    removeElement(index);
  }

  const activities = activitiesList.result.courseWork;
  buttonID = 0;

  div = document.createElement('div');
  div.id = 'activities';
  div.className = ' col-12 accordion';
  document.getElementById('content').appendChild(div);
  for (let index = 0; index < activities.length; index++) {

    //id de courseId 
    var courseId = activities[index].courseId;
    //id of the activity
    var idActivity = activities[index].id;
    //id del usuario logueado userIDLogged
    //retroalimentacion

    //enviar courseId, idActivity, userIDLogged
    var res = await fetch(``, { method: 'GET' });


    //validate userIDLogged is the ownerId
    var sectionComment = null;
    if (userIDLogged == activities[index].creatorUserId) {
      sectionComment = `
      <input type="text" class="form-control" placeholder="Agregar retroalimentacion" id="comment${index}">
      <button class="btn btn-primary" onclick="addComment('${activities[index].id}')">Agregar retroalimentacion</button>`;
    } else {
      sectionComment = `<button class="btn btn-primary" onclick="getComments('${activities[index].id}')">Ver retroalimentacion</button>`;
    }

    //get studentSubmissions.get
    var studentSubmissions = await gapi.client.classroom.courses.courseWork.studentSubmissions.list({
      courseId: courseId, courseWorkId: idActivity
    });

    var studentSubmissionsList = studentSubmissions.result.studentSubmissions;

    console.log("studentSubmissions:", studentSubmissions);
    console.log("studentSubmissionsList:", studentSubmissionsList);
    var grade;
    for (let index = 0; index < studentSubmissionsList.length; index++) {

      //verify if exist assignedGrade
      if (studentSubmissionsList[index].assignedGrade != null) {
        grade = studentSubmissionsList[index].assignedGrade;
      } else {
        grade = "Sin calificar";
      }
    }

    console.log(JSON.stringify(activities[index]));
    const divAcordion = document.createElement('div');
    divAcordion.id = index;
    divAcordion.innerHTML += `
    <div class="accordion-item">
    <h2 class="accordion-header" id="panelsStayOpen-heading${index}">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" 
      data-bs-target="#panelsStayOpen-collapse${index}" aria-expanded="true" 
      aria-controls="panelsStayOpen-collapse${index}">
        ${activities[index].title} - ${grade}
      </button>
    </h2>
    <div id="panelsStayOpen-collapse${index}" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-heading${index}">
      <div class="accordion-body">
        <p>${activities[index].description}</p>
        <p>${sectionComment}</p>
      </div>
    </div>
  </div>`;

    buttonID++;
    document.getElementById('activities').appendChild(divAcordion);
    divAcordion.onclick = async function () {
    }
    /* 
        const button = document.createElement("button");
        button.id = index;
        button.type = 'button';
        button.innerText = activities[index].title;
        document.body.appendChild(button);
        buttonID++;
        button.onclick = async function () { } */


  }


  console.log("getActivity:", buttonID);


  const buttonBack = document.createElement("button");
  buttonBack.id = "back";
  buttonBack.type = 'button';
  buttonBack.innerText = "Atrás";
  document.body.appendChild(buttonBack);
  buttonBack.onclick = async function () {
    listCourses();
    document.getElementById('activities').remove();

    removeElement("back");

  }
}



//if (localStorage.getItem('tokenClient') !== null) { gapiLoaded(); maybeEnableButtons(); handleAuthClick() };
