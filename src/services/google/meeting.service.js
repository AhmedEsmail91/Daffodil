// services/googleMeetService.js
const { google } = require('googleapis');
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uri = process.env.GOOGLE_CALLBACK_URL;

// OAuth2 client instance
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);
/**
 * Create a Google Meet event.
 * @param {Object} tokens - { accessToken, refreshToken }
 * @param {string} startTime - ISO date string for start
 * @param {string} endTime - ISO date string for end
 * @param {string} summary - Event title
 * @param {string[]} attendees - List of emails
 * @returns {Promise<string>} - Meet link
 */
async function createMeetEvent(tokens, startTime, endTime, summary, notes, attendees = []) {
  oAuth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const event = {
    summary: summary||'online Meeting',
    description: notes || 'No additional notes provided',
    start: { dateTime: startTime, timeZone: 'UTC' },
    end: { dateTime: endTime, timeZone: 'UTC' },
    attendees: attendees.map(email => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: `req-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
  });

  return res;
}
/**
 * Create a Google Meet event.
 * @param {Object} tokens - { accessToken, refreshToken }
 * @param {string} startTime - ISO date string for start
 * @param {string} endTime - ISO date string for end
 * @param {string} summary - Event title
 * @param {string[]} attendees - List of emails
 * @returns {Promise<string>} - Calendar event url
 */
async function createCalendarEvent(tokens, startTime, endTime, summary, notes, attendees = []) {
  oAuth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const event = {
    summary: summary || 'in-person Appointment',
    description: notes || 'No additional notes provided',
    start: { dateTime: startTime, timeZone: 'UTC' },
    end: { dateTime: endTime, timeZone: 'UTC' },
    attendees: attendees.map(email => ({ email })), // optional
  };

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return {
      eventId: res.data.id,
      htmlLink: res.data.htmlLink, // link to calendar event
      status:true
    };
  } catch (err) {
    console.error('Error creating event:', err);
    throw err;
  }
}

module.exports = { createMeetEvent, oAuth2Client, createCalendarEvent };
