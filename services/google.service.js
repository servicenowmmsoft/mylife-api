//-- BEGIN Define Google API
import {default as fsWithCallbacks} from 'fs';
import path from 'path';
import process from 'process';
import {authenticate} from '@google-cloud/local-auth';
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';
const fs = fsWithCallbacks.promises;
//-- END Define Google API

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', "https://www.googleapis.com/auth/drive"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), '/data/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), '/data/credentials.json');
const GOOGLEDRIVE_PATH = path.join(process.cwd(), '/data/googleDrive.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: ["https://www.googleapis.com/auth/drive"],
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Search file in drive location
 * @return{obj} data file
 * */
 export async function searchFile(authClient) {
  const drive = google.drive({version: 'v3', auth: authClient});
  try {
    const content = await fs.readFile(GOOGLEDRIVE_PATH);
    const googleDriveData = JSON.parse(content);
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: 'nextPageToken, files(id, name, parents, mimeType, shared)',
      spaces: 'drive',
    });
    const results = [];
    const FILES = await searchChildFile(drive);
    res.data.files.forEach(function(file) {
      var parent = (file.parents && file.parents.length > 0) ? file.parents[0] : "";
      if(parent == googleDriveData.ROOT){
        file.child = [];
        results.push(file);
      }else{
        var parentTemp = results.find(c => file.parents.indexOf(c.id) > -1);
        if(parentTemp){
          file.files = FILES.filter(c => c.parents.indexOf(file.id) > -1);
          parentTemp.child.push(file);
        }
      }
    });
    return results;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

/**
 * Search child file in drive location
 * @return{obj} data file
 * */
 export async function searchChildFile(drive) {
  try {
    const res = await drive.files.list({
      q: "mimeType='image/jpeg' or mimeType='image/png'",
      fields: 'nextPageToken, files(id, name, parents, mimeType, shared)',
      spaces: 'drive',
    });
    return res.data.files;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

/**
 * Upload a file to the specified folder
 * @param{string} folderId folder ID
 * @return{obj} file Id
 * */
 export async function uploadToFolder(folderId, auth, fileUpload) {
    const service = google.drive({version: 'v3', auth});
    try {
      const filename = fileUpload.originalname ? fileUpload.originalname : fileUpload.name;
      const fileType = fileUpload.mimetype ? fileUpload.mimetype : fileUpload.type;
      const fileMetadata = {
        name: filename,
        parents: [folderId],
      };
      const media = {
        mimeType: fileType,
        body: fsWithCallbacks.createReadStream("./public/" + filename)
      };

      const file = await service.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });
      return {
        success: true,
        fileId: file.data.id
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
}