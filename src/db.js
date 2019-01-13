'use strict'
const firebase = require('firebase')

const config = {
  apiKey: 'AIzaSyBuZZDWUEWeH7jcV5qoAJYKS9pbJI_wB-E',
  authDomain: 'project-633b2.firebaseapp.com',
  databaseURL: 'https://project-633b2.firebaseio.com',
  projectId: 'project-633b2',
  storageBucket: 'project-633b2.appspot.com',
  messagingSenderId: '104822146606'
}
firebase.initializeApp(config)

module.exports = firebase.database()