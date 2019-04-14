const CONFIG = require("./config");
const Twit = require("twit");
const chalk = require("chalk");
const fs = require('fs')


//Twit NPM CONFIG
T = new Twit(CONFIG.twitter);

//list of user to listen for @
const users = [];

// stream to listen to the users
const stream = T.stream("statuses/filter", {
  follow: users
});

// reading the image to upload
let b64content = fs.readFileSync('./image.jpg', { encoding: 'base64' })

stream.on("tweet", async tweet => {

  //will not replay to itself
  if (tweet.user && !tweet.in_reply_to_status_id) {
    //The POST
    T.post('media/upload', { media_data: b64content },  (err, data, response)=> {
      // now we can assign alt text to the media, for use by screen readers and
      // other text-based presentations and interpreters
      let mediaIdStr = data.media_id_string
      let altText = "Small flowers in a planter on a sunny balcony, blossoming."
      let meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
     
      T.post('media/metadata/create', meta_params, function (err, data, response) {
        if (!err) {
          // now we can reference the media and post a tweet (media will attach to the tweet) 
          T.post(
            "statuses/update",
            {
              status: 'loving life #nofilter',
              media_ids: [mediaIdStr],
              in_reply_to_status_id: tweet.id_str,
              auto_populate_reply_metadata: true
            },
            err => {
              if (err) {
                console.log(
                  chalk.red(
                    `[Twitter] Error tweeting at @${tweet.user.screen_name}!`,
                    err
                  )
                );
              } else {
                console.log(
                  chalk.green(
                    `[Twitter] Tweeted successfully at @${tweet.user.screen_name}!`
                  )
                );
              }
            }
          );
        }
      })
    })

  }
});





