const {catchError}=require('../../../utils/errors/catchError.js')
const { ProviderAccount } = require('../../../database/models'); 
const { createMeetEvent } = require('./meet.service.js');
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
    return credentials.access_token;
}

const createMeeting=catchError(async (req,res,next)=>{
    const {user_id}=req.auth
    const providerAccount = await ProviderAccount.findOne({
      where: { provider: 'google', user_id },
    });

    if (!providerAccount) {
      return res.status(400).json({ error: 'Google account not connected' });
    }

    const accessToken = await refreshToken(providerAccount);
    if (providerAccount.accessToken !== accessToken) {
        providerAccount.accessToken = accessToken;
        await providerAccount.save();
    }
    
    const { start, end, summary } = req.body;
    const meetLink = await createMeetEvent(
      {
        accessToken,
        refreshToken: providerAccount.refreshToken,
      },
      start,
      end,
      summary
    );
    res.json({ meetLink });
})
module.exports={
    createMeeting
}