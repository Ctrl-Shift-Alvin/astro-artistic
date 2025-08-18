import { ZTranslation } from './global';
import { ContactConfig } from '@/shared/config/contact';
import {
	calculateAge, dateOfBirth
} from '@/shared/dataParse';

export const Translation = ZTranslation.parse({
	meta: {
		title: 'Maxwell Max Maxunwell',
		description: 'Welcome to my portfolio!'
	},
	navbar: {
		title: 'Maxwell Max Maxunwell',
		homepage: 'Homepage',
		events: 'Events',
		others: 'Others',
		blog: 'Blog',
		contact: 'Contact'
	},
	footer: {
		admin: 'Admin',
		siteInfo: 'Site Info'
	},
	fourOfour: {
		title: '404 - Page Not Found',
		description:
			'The page you are looking for does not exist. Please check the URL or return to the homepage.\n'
			+ 'If there are pages similar to the one you are looking for, they will be listed below, '
			+ 'and you can click them to navigate.',
		button: 'Go to Homepage'
	},
	heroAvatar: {
		title: 'About Me',
		description: `Hello! I am Maxwell Max Maxunwell, a ${calculateAge()}-year-old professional human. I specialize in bodily functions, such as breathing, circulating blood and most occasionally photosynthesis. Though, some of these might stop occasionally if I get too lazy. To see me perform these miracles of God, check out my social media channels:`
	},
	card1: {
		title: 'My Life',
		description: `I was born on ${dateOfBirth.toDateString()} on Planet Earth as most of us here, and since the day I first saw light, I expelled at being human. I was so good at it, that I even made my parents (my mum) cry when I took my first breath. Ever since I have focused solely on improving my performance as a human being. Today I am one of the most human beings.`,
		buttonText: ''
	},
	card2: {
		title: 'Others',
		description:
			'For less vital human services, you may visit this page, where I provide professional insight into '
			+ 'i.a. movement, erections and thinking.',
		buttonText: 'Read More'
	},
	contact: {
		title: 'Contact',
		formDescription: 'Or contact me using the form below: ',
		email: 'Email',
		phoneNumber: 'Phone Number',
		firstName: 'First Name',
		lastName: 'Last Name',
		message: 'Message',
		submit: 'Send',
		feedback: {
			noError:
				'Message sent successfully! I will get back to you as soon as possible! :)',
			resendError:
				'You already sent a message. If you want to send another one, please press submit again to confirm!',
			nameError: 'Error: Please enter a name! Thank you! :)',
			emailError: 'Error: Please enter a valid email! Thank you! :)',
			phoneNumberError: 'Error: Please enter a phone number! Thank you! :)',
			messageError: 'Error: Please write a message! Thank you! :)',
			sendingError:
				'Oh no, something on my part went wrong sending the text. Please contact me via telephone or email!',
			duplicateError:
				'Your message was sent, but discarded, because it is a duplicate and was already sent before.'
		}
	},
	siteInfo: {
		title: 'Website Info',
		madeUsing: [
			'This website was created using ',
			'.'
		],
		basedOn: [
			'Based on the template: ',
			' by '
		], // Please keep this at least, so I at least get ONE SINGLE LINE OF CREDIT FOR THIS AGONIZING PROJECT
		madeBy: [
			'Translated by: ',
			''
		]
	},
	blog: {
		title: 'Blog',
		description: 'Welcome to my blog!',
		recentPosts: 'Recent Posts',
		gotoBlogButton: 'View All Blog Posts'
	},
	pagination: { pageWord: 'Page' },
	others: {
		title: 'Others',
		description: 'Others',
		card1: {
			title: 'Movement',
			description: 'Movement is a less important human bodily function that might be important to some people. '
				+ 'Professional humans, however, stride to avoid this at all cost.'
		},
		card2: {
			title: 'Erections',
			description: 'While around 49.72% of this world\'s human population lack this function '
				+ '(instead offering a more nerfed alternative), it works best when hidden from family members '
				+ '(and generally other people). Some humans might like to occasionally show it to another person, '
				+ 'mostly of the opposite sex. However, professional humans are strongly opposed to showing it to'
				+ 'another being.'
		},
		card3: {
			title: 'Thinking',
			description: 'Professional humans strongly oppose this human behaviour, since it often causes depression.'
		},
		card4: {
			title: 'Key Points',
			points: [
				'I am a professional human.',
				'I specialize in bodily functions.',
				'I may professionally guide you into improving all kinds of bodily functions, such as:',
				'Breathing',
				'Circulating Blood',
				'Regulating Temperature',
				'My rate is 100$/hour, no negotiating!'
			]
		}
	},
	events: {
		title: 'Events',
		description: 'Events',
		dateRow: 'Date',
		locationRow: 'Location',
		titleRow: 'Title'
	},
	sizeError: {
		body: 'Your display\'s size is too small! If possible, please turn your device 90°!\n'
			+ 'You can ignore this warning, but the website might look wrong while your display size remains too small!',
		ignoreButton: 'Ignore'
	},
	offline: {
		title: 'Offline',
		description: 'You are offline.',
		body: 'You are not connected to the internet or the server is currently not reachable.'
			+ 'Meanwhile, here are my contact details should you have any questions:\n'
			+ `Phone number: ${ContactConfig.contacts.default!.telNumber}\n`
			+ `Email: ${ContactConfig.contacts.default!.email}`
	}
});
