'use strict'

const db = require('./db')
const util = require('./utils')
const moment = require('moment')

const repository = {}

repository.saveReminder = reminder => {
    reminder.dateCreated = moment().format('MM/DD/YYYY HH:mm:ss')
    return db.ref('reminders').push(reminder)
}


repository.updateReminder = reminder => {
    return db.ref(`reminders/${reminder.key}`).update({
        scheduled: reminder.scheduled,
        dateUpdated: moment().format('MM/DD/YYYY HH:mm:ss')
    });
}

repository.getReminders = async () => {
    const reminders = util.snapshotToArray(await db.ref('reminders').once('value'))
    return reminders
}


repository.getReminderByScheduled = async (scheduled) => {
    const reminders = util.snapshotToArray(await db.ref(`reminders`).orderByChild('scheduled').equalTo(scheduled).once('value'))
    return reminders
}

repository.getReminderByEmail = async (email) => {
    const reminders = util.snapshotToArray(await db.ref(`reminders`).orderByChild('email').equalTo(email).once('value'))
    return reminders
}


repository.getReminderByUuid = async (uuid) => {
    const reminder = util.snapshotToArray(await db.ref(`reminders`).orderByChild('uuid').equalTo(uuid).once('value')).shift()
    return reminder
}

repository.getReminderByRef = async (ref) => {
    const reminder = util.snapshotToArray(await db.ref(`Reminders/${ref}`).once('value')).shift()
    return reminder
}

module.exports = repository