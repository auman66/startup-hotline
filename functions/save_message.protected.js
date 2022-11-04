// AirTable Setup
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const airtable = require("airtable");

const base = new airtable({
  apiKey: AIRTABLE_API_KEY,
}).base(AIRTABLE_BASE_ID);

exports.handler = function (context, event, callback) {
  base("messages").create(
    [
      {
        fields: {
          Call: event.CallSid,
          Message: event.TranscriptionText,
          Message_URL: event.RecordingUrl,
          Call_URL: `https://www.twilio.com/console/voice/calls/logs/${event.CallSid}`,
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return callback(err);
      }
      records.forEach(function (record) {
        console.log(record.getId());
      });
      return callback();
    }
  );
};
