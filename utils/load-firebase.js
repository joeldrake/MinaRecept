export default async () => {
  await import('firebase/firestore');
  await import('firebase/auth');
  const firebase = await import('firebase/app');

  try {
    var config = {
      apiKey: 'AIzaSyCz17GnrYJs02MnBuUHfelGBVnizFhWNlw',
      authDomain: 'mina-recept-89a16.firebaseapp.com',
      databaseURL: 'https://mina-recept-89a16.firebaseio.com',
      projectId: 'mina-recept-89a16',
      storageBucket: 'mina-recept-89a16.appspot.com',
      messagingSenderId: '582219355833',
    };
    firebase.initializeApp(config);
  } catch (err) {
    // we skip the "already exists" message which is
    // not an actual error when we're hot-reloading
    if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack);
    }
  }

  //return firebase;
  return firebase;
};
