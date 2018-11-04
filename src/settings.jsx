import merge from 'deepmerge';

//override these on your page with window.config
const settings = merge({
	defaults: {
		columns: ['time', 'name', 'location', 'address', 'region'], //can be reordered
		mode: 'search', //start in keyword search mode
		today: true, //start with today's meetings, vs any day
		view: 'list', //start in list or map view
	},
	days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
	element_id: 'app', //the id of the HTML container element
	filters: ['regions', 'days', 'times', 'types'],
	json: '/meetings.json', //path to JSON file (required)
	keys: {
		google: null, //enable google maps
		mapbox: null, //enable mapbox maps
	},
	modes: ['search', 'location'],
	query_separator: '+',
	strings: {
		address: 'Address',
		days_any: 'Any Day',
		evening: 'Evening',
		friday: 'Friday',
		in: 'in', //todo find way to do this with string pattern
		list: 'List',
		location: 'Location',
		map: 'Map',
		meetings: 'Meetings',
		midday: 'Midday',
		monday: 'Monday',
		morning: 'Morning',
		name: 'Name',
		modes: {
			location: 'Near Location',
			me: 'Near Me',
			search: 'Search',
		},
		night: 'Night',
		no_results: 'No meetings were found matching the selected criteria.',
		region: 'Region',
		regions_any: 'Everywhere',
		saturday: 'Saturday',
		sunday: 'Sunday',
		thursday: 'Thursday',
		time: 'Time',
		times_any: 'Any Time',
		tuesday: 'Tuesday',
		types: {
			'11': '11th Step Meditation',
			'12x12': '12 Steps & 12 Traditions,',
			ASBI: 'As Bill Sees It',
			BA: 'Babysitting Available',
			B: 'Big Book',
			H: 'Birthday',
			BRK: 'Breakfast',
			AN: 'Candlelight',
			CF: 'Child-Friendly',
			C: 'Closed',
			'AL-AN': 'Concurrent with Al-Anon',
			AL: 'Concurrent with Alateen',
			XT: 'Cross Talk Permitted',
			DR: 'Daily Reflections',
			DB: 'Digital Basket',
			D: 'Discussion',
			DD: 'Dual Diagnosis',
			EN: 'English',
			FF: 'Fragrance Free',
			FR: 'French',
			G: 'Gay',
			GR: 'Grapevine',
			NDG: 'Indigenous',
			ITA: 'Italian',
			JA: 'Japanese',
			KOR: 'Korean',
			L: 'Lesbian',
			LIT: 'Literature',
			LS: 'Living Sober',
			LGBTQ: 'LGBTQ',
			MED: 'Meditation',
			M: 'Men',
			N: 'Native American',
			BE: 'Newcomer',
			NS: 'Non-Smoking',
			O: 'Open',
			POC: 'People of Color',
			POL: 'Polish',
			POR: 'Portuguese',
			P: 'Professionals',
			PUN: 'Punjabi',
			RUS: 'Russian',
			A: 'Secular',
			ASL: 'Sign Language',
			SM: 'Smoking Permitted',
			S: 'Spanish',
			SP: 'Speaker',
			ST: 'Step Meeting',
			TR: 'Tradition Study',
			T: 'Transgender',
			X: 'Wheelchair Access',
			XB: 'Wheelchair-Accessible Bathroom',
			W: 'Women',
			Y: 'Young People',
		},
		types_any: 'Any Type',
		wednesday: 'Wednesday',
		with: 'with',
	},
	times: ['morning', 'midday', 'evening', 'night'],
}, window.config);

export default settings;