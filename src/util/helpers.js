// instantiate the Flux SDK with your appliation key
let sdk;
let helpers;
let user = null;
let dataTables = {};

export function login() {
    helpers.redirectToFluxLogin()
}

export function logout() {
  helpers.logout();
}

/**
 * Get the Flux user.
 */
export function getUser() {
  if (!user) {
    user = helpers.getUser()
  }
  return user
}

export function init(config) {
    // Window contains FluxSdk and FluxHelpers, which were loaded in index.html via script src
    sdk = new window.FluxSdk(config.flux_client_id, { redirectUri: config.url, fluxUrl: config.flux_url });
    helpers = new window.FluxHelpers(sdk)

    // Check if we're coming back from Flux with the login credentials.
    return helpers.storeFluxUser()
        // check that the user is logged in, otherwise show the login page
        .then(function() { return helpers.isLoggedIn() });

}
/**
 * Get a project's data table.
 */
function getDataTable(project) {
  if (!(project.id in dataTables)) {
    let dt = getUser().getDataTable(project.id)
    dataTables[project.id] = { table: dt, handlers: {}, websocketOpen: false }
  }
  return dataTables[project.id]
}

/**
 * Get the user's Flux projects.
 */
export function getProjects() {
  return getUser().listProjects()
}

/**
 * Get a list of the project's cells (keys).
 */
export function getCells(project) {
  return getDataTable(project).table.listCells()
}

/**
 * Get a specific project cell (key).
 */
function getCell(project, cell) {
  return getDataTable(project).table.getCell(cell.id)
}

/**
 * Create a project cell (key) in Flux.
 */
function createCell(project, name) {
  let dt = getDataTable(project).table
  return dt.createCell(name, {description: name, value: ''})
}

/**
 * Get the value contained in a cell (key).
 */
export function getValue(project, cell) {
  return getCell(project, cell).fetch()
}

/**
 * Update the value in a project cell (key).
 */
export function updateCellValue(project, cell, value) {
  let cellContents = getUser().getCell(project.id, cell.id)
  return cellContents.update({value: value})
}

/**
 * Creates a websocket for a project that listens for data table events, and calls
 * the supplied handler function
 */
function createWebSocket(project, notificationHandler){
  let dataTable = getDataTable(project)
  let options = {
    onOpen: function() { console.log('Websocket opened.') },
    onError: function() { console.log('Websocket error.') }
  }

  // if this data table doesn't have websockets open
  if (!dataTable.websocketOpen) {
    dataTable.websocketOpen = true
    // open them
    dataTable.table.openWebSocket(options)

    // and attach the handler we created above
    if(notificationHandler)
      dataTable.table.addWebSocketHandler(notificationHandler)
  }
}
