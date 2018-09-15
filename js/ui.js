console.log('connected with ui.js file');

document.addEventListener('DOMContentLoaded', function() {
	let options = {};
	var elems = document.querySelectorAll('.dropdown-trigger');
	var instances = M.Dropdown.init(elems, options);
});


const sendButton = document.querySelector('#send-button');

// select conversation list
const conversationList = document.querySelector('#conversation-content');


//select text input
const textInput = document.querySelector('#text-input');

console.log(sendButton);
console.log(conversationList);
console.log(textInput);

// attach the event listener to the sendButton for all clicks
// when a user clicks the send button,a <li></li> message should be added
// to the conversationLis with a message inside it that is the same as
// whatever is inside the textInput

sendButton.addEventListener('click', e => {
	let text = textInput.value;
	conversationList.innerHTML += `<li>${text}</li>`; // (+=) to add every message typed
	submitTextMessage(text);
	textInput.value = '';
});

document.addEventListener('keypress', e => {
	const key = e.which || e.keyCode;
	if (key === 13) { //13 is enter key
		let text = textInput.value;
		//conversationList.innerHTML += `<li>${text}</li>`;
		submitTextMessage(text); // function from firebase.js
		textInput.value = '';
	}
});

// functions to singin/out with google (button)
const signInButton = document.querySelector('#sign-in-button');
const signOutButton = document.querySelector('#sign-out-button');

//functions signInWithGoogle and signOutWithGoogle are called from firebase.js file
signInButton.addEventListener('click', e =>{
	signInWithGoogle();
});

signOutButton.addEventListener('click', e =>{
	signOutWithGoogle();
});

const authDropdownItem = document.querySelector('#auth-dropdown-button');
// function to switch more_vert button to avatar from google
function updateUIforSignIn(avatarSrc) {
	authDropdownItem.innerHTML = `<i><img class="avatar-image" src="${avatarSrc}" /></i>`;
}

function updadeUIforSignOut() {
	authDropdownItem.innerHTML = `<i class="material-icons">more_vert</i>`;
	contactList.innerHTML = '';
	recipientName.innerHTML = '';
	contactList.innerHTML = '';
}

const contactList = document.querySelector('#contact-list');
function updateUIwithNewContact(userInfo) {
	contactList.innerHTML +=
	`
	<li onclick="displayTextsFrom('${userInfo.id}','${userInfo.name}');" class="contact-item avatar">
		<img src="${userInfo.photoURL}" class="circle avatar-image"/>
		<div class="contact-name-and-text">
			<h6 class="title">${userInfo.name}</h6>
			<p class="grey-text last-text-message">Fake text...</p>
		</div>

		<div class="contact-timestamp">
			<p class="grey-text">4:00 PM</p>
		</div>
	</li>
	`;
}

const recipientName = document.querySelector('#recipient-name');
function displayTextsFrom(uid, userName) {
	recipientName.innerHTML = userName;
	console.log('displaying texts from' +uid+ 'with the name'+ userName);
	updateUIforCurrentConversation({
		id: uid,
		name: userName
	});
}

async function updateUIforCurrentConversation(userInfo) {
	const currentUserId = auth.currentUser.uid;
	const { id, name }= userInfo;
	const firstLetter = name[0].toUpperCase();
	recipientName.innerHTML = name;
	conversationList.innerHTML = '';

	App.currentRecipientId = id;
	App.currentRecipientName = name;
	const sentMessages = await getUserSentMessages(currentUserId, userInfo.id);
	const receivedMessages = await getUserReceivedMessages(currentUserId, userInfo.id);

	console.log('sent messages'+JSON.stringify(sentMessages));
	console.log('received messages'+JSON.stringify(receivedMessages));

	const allMessages = sentMessages.concat(receivedMessages)
	.sort((m1, m2) => {
		if (!m1.timestamp) return 1
		if (!m2.timestamp) return -1
		return m1.timestamp.seconds - m2.timestamp.seconds;
	});

	allMessages.forEach( message => insertMessageIntoUi(message, currentUserId, firstLetter));
}

function insertMessageIntoUi(message, currentUserId, firstLetter) {
	if (message.sender === currentUserId) {
		conversationList.innerHTML +=
		`
		<li class="conversation-item-holder-right">
			<span class="conversation-item-right blue lighten-5 black-text">${message.text}</span>
		</li>
		`;
	} else {
		conversationList.innerHTML +=
		`
		<li class="conversation-item-holder-left">
			<i class="material-icons avatar-icon blue accent-1" >${firstLetter}</i>
			<span class="conversation-item-left blue accent-1 white-text">${message.text}</span>
		</li>
		`;
	}

	conversationList.scrollTop = conversationList.scrollHeight;
}

function refreshUIwithMessages() {
	const id = App.currentRecipientId;
	const name = App.currentRecipientName;
	displayTextsFrom(id, name);
}