'use strict'

const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('api:ws')
const asyncify = require('express-asyncify')
const moment = require('moment')
const repository = require('./repository')
const path = require('path')
const uuidv4 = require('uuid/v4')
const slackInvite = require('slack-invite');
const Slack = require('slack-node');
const request = require('request');

const api = asyncify(express.Router())
const tokenClient = process.env.TOKEN_SLACK_CLIENT;


const tokenBot = process.env.TOKEN_SLACK_BOT;
api.get('/', (req, res, next) => {
  debug(`Request successful, ${chalk.green('Endpoint Worked!')}`)
  res.send('Endpoint Worked!')
})

api.get('/test', (req, res, next) => {
  debug(`Request successful, ${chalk.green('Endpoint Worked!')}`)
  res.send('Endpoint Worked!')
})

api.get('/all', async (req, res, next) => {
  try {
    const { authorization } = req.headers
    if (!authorization || authorization !== process.env.TOKEN_AUTH) {
      res.status(401).send({ errors: 'Auth Denied' });
      return next()
    }
    const reminders = await repository.getReminders()
    res.send(reminders)
  } catch (error) {
    console.log(`Error, ${chalk.red(error)}`)
    return next(error)
  }
})

api.get('/:email/byemail', async (req, res, next) => {
  try {
    const { email } = req.params
    const reminders = await repository.getReminderByEmail(email)
    res.send(reminders)
  } catch (error) {
    console.log(`Error, ${chalk.red(error)}`)
    return next(error)
  }
})

api.post('/save', async (req, res, next) => {
  try {
    const { dateSchedule, email, message } = req.body


    const slack = new Slack(tokenBot);

    slack.api("users.list", async function (err, response) {
      if (err) {
        res.status(500).send({ errors: err });
        return next()
      }
      const members = response.members
      const member = members.filter(memb => memb.profile.email === email).shift()

      if (member) {
        const dateValidate = moment(dateSchedule, 'MM/DD/YYYY HH:mm:ss').subtract(5, 'hours').toDate()
        const dateCurrent = moment(moment().add(5, 'minutes').toDate()).subtract(5, 'hours').toDate()

        if (dateValidate < dateCurrent) {
          res.status(400).send({ errors: 'Param dateSchedule is less than current date' });
          return next()
        }

        const rem = {
          uuid: uuidv4(),
          scheduled: false,
          dateSchedule,
          email,
          message
        }
        const reminder = await repository.saveReminder(rem)
        res.send(`Reminder Saved! ${reminder} and uuud ${rem.uuid}`)

      } else {

        request.post("https://reminderapp-workspace.slack.com/api/users.admin.invite", {
          form: {
            email,
            token: tokenClient,
            set_active: true,
            _attempts: 1
          }
        }, function (err, httpResponse, body) {
          if (err) {
            res.status(500).send({ errors: err });
            return next()
          }
          res.status(200).send({ info: 'Email no found in Slack, Invitation Send' });
          return next()
        });

        /* slackInvite({
           email, // set your email to invite here
           token: tokenClient, // set your token here
           team: 'reminderapp-workspace'
         }, function (err, response) {
           if (err) {
             res.status(500).send({ errors: err });
             return next()
           }
         });*/
      }
    });


  } catch (error) {
    console.log(`Error, ${chalk.red(error)}`)
    return next(error)
  }
})

module.exports = api