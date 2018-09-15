const auth = firebase.auth(); // auth to connect the firebase server
const database = firebase.firestore(); 

const settings = {/* your settings... */ timestampsInSnapshots: true};
database.settings(settings);

//Auth using pop up
const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('profile'); // access authorization
provider.addScope('email');

window.onload = function() {
	initializeApp();
}

// function onAuthStateChanged to check state of user are logged in or not and store it on cookies
function initializeApp() {
	auth.onAuthStateChanged(function(user){
		if (user) {
			const avatarSrc = user.photoURL;
			updateUIforSignIn(avatarSrc);
			getUsersFriends();
		} else {
			updadeUIforSignOut();
		}
	});
}

function signInWithGoogle() {
  console.log('sign In');

  	auth.signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token.
    const token = result.credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    const avatarSrc = user.photoURL;
    const name = user.displayName;
    const email = user.email;
    const userId = user.uid;

    const userInfo = {
    	name: name,
    	id: userId,
    	photoURL: avatarSrc,
    	email: email
    }

    addUserToDatabase(userInfo, userId);
    updateUIforSignIn(avatarSrc); // function created at ui.js

    console.log(user);
  });
}

function addUserToDatabase(userInfo, userId) {
	const userCollectionRef = database.collection('users'); // create/get a reference for the collection you need
	const newUserRef = userCollectionRef.doc(userId); // create a doc into that collection
	newUserRef.set(userInfo); // set the info equal to what you want
}

function  signOutWithGoogle() {
  auth.signOut().then( function(){
  	console.log('sign Out');
  	updadeUIforSignOut(); // function created at ui.js
  }); // signOut() method from firebase to sign out google
}

function getUsersFriends() {
	contactList.innerHTML = '';
	const user = auth.currentUser; // to check users on
	const userId = user.uid;
	// query to open collection/ get() to get all users// snapshot to capture whole db
	const query = database.collection('users').get().then( snapshot => {
		if (snapshot.size) {
			snapshot.forEach(doc => {
				let userInfo = doc.data();

				updateUIwithNewContact(userInfo);//function created at ui.js
			});
		}
	});
}

function submitTextMessage(text) {
	const recipientId = App.currentRecipientId;
	const uid = auth.currentUser.uid;

	const messagesRef = database.collection('messages');
	const messageInfo = {
		sender: uid,
		recipient: recipientId,
		text: text,
		timestamp: firebase.firestore.FieldValue.serverTimestamp()
	}
	messagesRef.add(messageInfo);

	refreshUIwithMessages();
}

async function getUserSentMessages(uid, recipientId) {
	const query = database.collection('messages')
	.where('sender', '==', uid)
	.where('recipient', '==', recipientId)
	//.orderBy('timestamp', 'desc')

	const snapshot = await query.get()

	if (snapshot.size) return snapshot.docs.map(doc => doc.data())

	return [ ];
}
	
async function getUserReceivedMessages(uid, recipientId) {
	const query = database.collection('messages')
	.where('sender', '==', recipientId)
	.where('recipient', '==', uid)
	//.orderBy('timestamp', 'desc')
	
	const snapshot = await query.get()

	if (snapshot.size) return snapshot.docs.map(doc => doc.data())

	return [ ];
}
