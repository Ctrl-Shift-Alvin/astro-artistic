import { ZTranslation } from './global';
import { ContactConfig } from '@/shared/config/contact';
import {
	calculateAge, dateOfBirth
} from '@/shared/dataParse';

export const Translation = ZTranslation.parse({
	meta: {
		title: 'Maxwell Max Maxunwell',
		description: 'Willkommen in meinem Portfolio!'
	},
	navbar: {
		title: 'Maxwell Max Maxunwell',
		homepage: 'Startseite',
		events: 'Veranstaltungen',
		others: 'Sonstiges',
		blog: 'Blog',
		contact: 'Kontakt'
	},
	footer: {
		admin: 'Admin',
		siteInfo: 'Seiteninfo'
	},
	fourOfour: {
		title: '404 - Seite nicht gefunden',
		description:
			'Die gesuchte Seite existiert nicht. Bitte überprüfen Sie die URL oder kehren Sie zur Startseite zurück.\n'
			+ 'Falls es Seiten gibt, die Ihrer Suche ähneln, werden diese unten angezeigt, und Sie können sie anklicken.',
		button: 'Zur Startseite'
	},
	heroAvatar: {
		title: 'Über mich',
		description: `Hallo! Ich bin Maxwell Max Maxunwell, ein ${calculateAge()}-jähriger professioneller Mensch. Ich spezialisiere mich auf Körperfunktionen wie Atmen, Blutzirkulation und gelegentlich Photosynthese. Einige dieser Funktionen pausieren manchmal, wenn ich zu faul bin. Um mich bei diesen Wundern Gottes zu beobachten, besuchen Sie meine Social-Media-Kanäle:`
	},
	card1: {
		title: 'Mein Leben',
		description: `Ich wurde am ${dateOfBirth.toDateString()} auf Planet Erde geboren, wie die meisten von uns hier, und seit dem Tag, an dem ich das Licht erblickte, brillierte ich darin, Mensch zu sein. Ich war so gut darin, dass ich sogar meine Eltern (meine Mutter) zum Weinen brachte, als ich meinen ersten Atemzug nahm. Seitdem konzentriere ich mich ausschließlich darauf, meine Performance als Mensch zu verbessern. Heute bin ich einer der menschlichsten Menschen.`,
		buttonText: ''
	},
	card2: {
		title: 'Sonstiges',
		description:
			'Für weniger lebenswichtige menschliche Dienstleistungen besuchen Sie bitte diese Seite, '
			+ 'auf der ich professionellen Einblick in u.a. Bewegung, Erektionen und Denken biete.',
		buttonText: 'Mehr lesen'
	},
	contact: {
		title: 'Kontakt',
		formDescription: 'Oder kontaktieren Sie mich über das folgende Formular:',
		email: 'E-Mail',
		phoneNumber: 'Telefonnummer',
		firstName: 'Vorname',
		lastName: 'Nachname',
		message: 'Nachricht',
		submit: 'Absenden',
		feedback: {
			noError:
				'Nachricht erfolgreich gesendet! Ich melde mich so bald wie möglich! :)',
			resendError:
				'Sie haben bereits eine Nachricht gesendet. Wenn Sie eine weitere senden möchten, '
				+ 'drücken Sie bitte erneut auf Absenden, um zu bestätigen!',
			nameError: 'Fehler: Bitte geben Sie einen Namen ein! Vielen Dank! :)',
			emailError:
				'Fehler: Bitte geben Sie eine gültige E-Mail ein! Vielen Dank! :)',
			phoneNumberError:
				'Fehler: Bitte geben Sie eine Telefonnummer ein! Vielen Dank! :)',
			messageError:
				'Fehler: Bitte schreiben Sie eine Nachricht! Vielen Dank! :)',
			sendingError:
				'Oh nein, beim Senden der Nachricht ist auf meiner Seite etwas schiefgelaufen. '
				+ 'Bitte kontaktieren Sie mich telefonisch oder per E-Mail!',
			duplicateError:
				'Ihre Nachricht wurde gesendet, aber verworfen, da es sich um ein Duplikat handelt, '
				+ 'das bereits zuvor gesendet wurde.'
		}
	},
	siteInfo: {
		title: 'Seiteninfo',
		madeUsing: [
			'Diese Website wurde erstellt mit ',
			'.'
		],
		basedOn: [
			'Basiert auf dem Template: ',
			' geschrieben von '
		],
		madeBy: [
			'Übersetzt von: ',
			''
		] // Bitte behalte das: Es ist eh die Einzige zeile, wo ich für diess SCHMERZHAFTE Projekt kreditiert werde
	},
	blog: {
		title: 'Blog',
		description: 'Willkommen in meinem Blog!',
		recentPosts: 'Neueste Beiträge',
		gotoBlogButton: 'Alle Blog-Beiträge ansehen'
	},
	pagination: { pageWord: 'Seite' },
	others: {
		title: 'Sonstiges',
		description: 'Sonstiges',
		card1: {
			title: 'Bewegung',
			description: 'Bewegung ist eine weniger wichtige menschliche Körperfunktion, die für manche Menschen '
				+ 'von Bedeutung sein könnte. Professionelle Menschen hingegen vermeiden sie um jeden Preis.'
		},
		card2: {
			title: 'Erektionen',
			description: 'Während etwa 49,72% der menschlichen Bevölkerung dieser Welt über diese Funktion nicht verfügen '
				+ '(stattdessen bieten sie eine eher abgeschwächte Alternative), funktioniert sie am besten, '
				+ 'wenn man sie vor Familienmitgliedern (und generell anderen Menschen) verbirgt. '
				+ 'Manche Menschen mögen es, sie gelegentlich einer anderen Person zu zeigen, meist vom anderen Geschlecht. '
				+ 'Professionelle Menschen lehnen es jedoch strikt ab, sie einem anderen Wesen zu präsentieren.'
		},
		card3: {
			title: 'Denken',
			description: 'Professionelle Menschen lehnen dieses menschliche Verhalten '
				+ 'strikt ab, da es häufig Depressionen verursacht.'
		},
		card4: {
			title: 'Wichtige Punkte',
			points: [
				'Ich bin ein professioneller Mensch.',
				'Ich spezialisiere mich auf Körperfunktionen.',
				'Ich kann Sie professionell anleiten, alle Arten von Körperfunktionen zu verbessern, wie z.B.:',
				'Atmen',
				'Blutzirkulation',
				'Temperaturregulation',
				'Mein Stundensatz beträgt 100$/Stunde, keine Verhandlungen!'
			]
		}
	},
	events: {
		title: 'Veranstaltungen',
		description: 'Veranstaltungen',
		dateRow: 'Datum',
		locationRow: 'Ort',
		titleRow: 'Titel'
	},
	sizeError: {
		body: 'Die Größe Ihres Displays ist zu klein! Wenn möglich, drehen Sie Ihr Gerät bitte um 90°!\n'
			+ 'Sie können diese Warnung ignorieren, aber die Website könnte fehlerhaft angezeigt werden, '
			+ 'solange die Displaygröße zu klein bleibt!',
		ignoreButton: 'Ignorieren'
	},
	offline: {
		title: 'Offline',
		description: 'Sie sind offline.',
		body: 'Sie sind nicht mit dem Internet verbunden oder die Webseite ist nicht erreichbar.\n'
			+ 'Hier finden Sie meine Kontaktdaten, falls Sie daweil Fragen haben:\n'
			+ `Telefonnummer: ${ContactConfig.contacts.default!.telNumber}\n`
			+ `Email: ${ContactConfig.contacts.default!.email}`
	},
	
});
