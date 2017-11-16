const express = require('express');
const app = express();
const port = process.env.PORT || 3005;
const bodyParser = require('body-parser');
const config = require('./config');
const slack = require('slack-notify')(config.SLACK_WEBHOOK_URL);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/test', (req, res) => {
  console.log('Test request received!');
  slack.send({
    icon_url: config.SLACK_WEBHOOK_IMAGE,
    username: config.SLACK_USERNAME,
    text: 'Congratulations! It works!'
  });
  res.json({ message: 'Test request received!' })
})

app.post('/', (req, res) => {
  const data = JSON.parse(req.body.payload);
  let color;
  
  if (!data)
    { return; }
  else if (data.status)
    { color = '#ae3636'; }
  else if (data.status === null)
    { color = ''; }
  else
    { color = '#36ae36'; }

  slack.send({
    icon_url: config.SLACK_WEBHOOK_IMAGE,
    username: config.SLACK_USERNAME,
    attachments: [
        {
          fallback: `[${data.repository.name}] Build #${data.number} is ${data.status_message.toLowerCase()}`,
          color: color,
          pretext: `Build <${data.build_url}|#${data.number}> of <https://github.com/${data.repository.owner_name}/${data.repository.name}|${data.repository.name}>/${data.branch} is ${data.status_message.toLowerCase()}`,
          title: data.message,
          title_link: data.build_url,
          fields: [
            {
              title: data.repository.name,
              value: data.branch,
              short: true
            }
          ],
          footer: `Commited by ${data.author_name}`,
          footer_icon: config.SLACK_WEBHOOK_IMAGE,
        }
      ]
  });
});

app.listen(port);
