const { google } = require('googleapis');
const refreshToken=async (providerAccount)=>{
  const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    oauth2Client.setCredentials({
      refresh_token: providerAccount.refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
}

module.exports = {refreshToken};