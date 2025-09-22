const { ProviderAccount } = require('../../../database/models'); 
const { createMeetEvent, oAuth2Client, createCalendarEvent } = require('./../../services/google/meeting.service.js');

function getFormattedDate(dateInstance){
  return `${dateInstance.getFullYear()}-${(dateInstance.getMonth() + 1).toString().padStart(2, '0')}-${dateInstance.getDate().toString().padStart(2, '0')} ${dateInstance.getHours().toString().padStart(2, '0')}:${dateInstance.getMinutes().toString().padStart(2, '0')}`;
}

async function refreshAccessToken(providerAccount) {
  oAuth2Client.setCredentials({
    refresh_token: providerAccount.refreshToken,
  });

  const { credentials } = await oAuth2Client.refreshAccessToken();
  return credentials.access_token;
}

const announceCalendarEvent = async (doctor_user_id, start, end, summary, mode, notes="No additional notes provided", attendees = []) => {
  const providerAccount = await ProviderAccount.findOne({
    where: { provider: 'google', user_id: doctor_user_id },
  });

  if (!providerAccount) {
    throw new Error('Google account not connected for this doctor');
  }

  // Always refresh the access token before use
  const accessToken = await refreshAccessToken(providerAccount);

  if (providerAccount.accessToken !== accessToken) {
    providerAccount.accessToken = accessToken;
    await providerAccount.save();
  }

  const tokens = {
    accessToken,
    refreshToken: providerAccount.refreshToken,
  };
  let calenderLink;
  if(mode=="online")
    // Create Google Meet event
    calenderLink = await createMeetEvent(
      tokens,
      start,
      end,
      summary,
      notes,
      attendees
    );
  else{
    // Create regular calendar event
    calenderLink = await createCalendarEvent(
      tokens,
      start,
      end,
      summary,
      notes,
      attendees
    );
  return calenderLink;
  }
};
module.exports={
    getFormattedDate,
    announceCalendarEvent
}