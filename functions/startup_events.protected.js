const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// Set up airtable
const airtable = require("airtable");
const base = new airtable({
  apiKey: AIRTABLE_API_KEY,
}).base(AIRTABLE_BASE_ID);

// Standard Serverless function
exports.handler = async function (context, event, callback) {
  // Get startup events from view
  const events = await base("All Startups Events")
    .select({
      view: "upcoming_events",
      maxRecords: 10,
      // Only get the fields we want
      fields: ["Event Name", "Date", "City", "Region", "Event Type"],
    })
    .all()
    .then((records) => {
      // Save the fields for each event
      let events = records.map((record) => {
        // Get rid of the array format for Event Type
        record.fields["Event Type"] = record.fields["Event Type"][0];
        return record.fields;
      });
      return events;
    })
    .catch((err) => {
      // If there is an error, record it and return that there are no events
      console.error(`ERROR: ${err}`);
      return callback(null, { len: 0 });
    });
  // Make each object into a nice text for sms
  let event_text = {};
  let count = 0;
  events.forEach((event) => {
    let e_text = "";
    Object.keys(event).forEach((key) => {
      e_text += `${key}: ${event[key]}\n`;
    });
    // Get rid of the last line break
    event_text[count] = e_text.substring(0, e_text.length - 1);
    count++;
  });

  // return all the data needed by studio
  return callback(null, { len: events.length, event_data: events, event_text });
};
