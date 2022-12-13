// AirTable Setup
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const airtable = require("airtable");

const base = new airtable({
  apiKey: AIRTABLE_API_KEY,
}).base(AIRTABLE_BASE_ID);

exports.handler = function (context, event, callback) {
  // params: message, sid, info

  let message = event.message;
  base("messages")
    .select({
      filterByFormula: `{SID}="${event.sid}"`,
    })
    .firstPage((err, records) => {
      // if error or no records found, create a new entry
      if (err || records.length == 0) {
        console.warn("No existing item found, creating a new one", err);
        base("messages").create(
          [
            {
              fields: {
                SID: event.sid,
                Type: "SMS",
                Info: event.info,
                Message: message,
                Event_URL: `https://www.twilio.com/console/studio/flows/FW40d43f70a824d7efb66229c3f464f9a1/executions/${event.sid}`,
              },
            },
          ],
          (errCreate, newRecord) => {
            if (errCreate) {
              console.error("Error creating new record", errCreate);
              return callback(null, { result: "failure", message });
            }
            return callback(null, {
              result: "new create",
              message,
              at_id: newRecord[0].getId(),
            });
          }
        );
      } else {
        // if no error, record found, update
        let oldMessage = "";
        if (typeof records[0].fields.Message !== "undefined")
          oldMessage = records[0].fields.Message + "\n----------\n";
        message = oldMessage + message;
        // Update existing record
        base("messages").update(
          [
            {
              id: records[0].id,
              fields: { Message: message },
            },
          ],
          (errUpdate, updateRecords) => {
            if (errUpdate) {
              console.error("Error updating record", errUpdate);
              return callback(null, { result: "failure", message });
            }
            return callback(null, {
              result: "updated",
              message,
              at_id: updateRecords[0].getId(),
            });
          }
        );
      }
    });
};
