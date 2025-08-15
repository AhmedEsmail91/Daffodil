// services/googleMeetService.js
const { google } = require('googleapis');
const credentials = require('../../../credentials.json'); // From Google Cloud Console

const { client_secret, client_id, redirect_uris } = credentials.web;

// OAuth2 client instance
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

/**
 * Create a Google Meet event.
 * @param {Object} tokens - { access_token, refresh_token }
 * @param {string} startTime - ISO date string for start
 * @param {string} endTime - ISO date string for end
 * @param {string} summary - Event title
 * @returns {Promise<string>} - Meet link
 */
async function createMeetEvent(tokens, startTime, endTime, summary = 'Meeting',attendees=[]) {
  oAuth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  const tokenInfo = await oAuth2Client.getTokenInfo(tokens.accessToken);
  console.log('Scopes:', tokenInfo.scopes);

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const event = {
    summary,
    start: { dateTime: startTime, timeZone: 'UTC' },
    end: { dateTime: endTime, timeZone: 'UTC' },
    conferenceData: {
      createRequest: {
        requestId: `req-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
      attendees: attendees.map(email => ({ email })),
    },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
  });
  
  const meetLink = res.data.hangoutLink;
  return meetLink;
}

module.exports = { createMeetEvent };
