import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import * as turf from '@turf/turf';

export async function load() {
	// load data
	const landfallData = await d3.csv('/hurricane-landfalls.csv', parseLandfallData);
	const countryData = await d3.json('/world-50m.json', function (d) {
		console.log(d);
	});
	const stateData = await d3.json('/states-10m.json');

	// geo data of countries
	const countries = topojson.feature(countryData, countryData.objects.countries).features;
	const countryBorders = topojson.mesh(
		countryData,
		countryData.objects.countries,
		(a, b) => a !== b
	);

	// geo data of us
	const usBorder = topojson.mesh(stateData, stateData.objects.states, (a, b) => a === b);
	const stateBorders = topojson.mesh(stateData, stateData.objects.states, (a, b) => a !== b);

	// use point in polygon function to filter us landfalls
	const states = topojson.feature(stateData, stateData.objects.nation);
	const usPolygon = turf.multiPolygon(states.features[0].geometry.coordinates);
	const usLandfalls = landfallData.filter((d) => {
		const point = turf.point([d.Longtitude, d.Latitude]);
		return turf.booleanPointInPolygon(point, usPolygon);
	});

	// prrpare data for stacked area/bar chart
	const aggregateData = prepAggregateData(usLandfalls);

	return {
		landfallData,
		countryData,
		stateData,
		countries,
		countryBorders,
		usBorder,
		stateBorders,
		usLandfalls,
		aggregateData
	};
}

function parseLandfallData(d) {
	return {
		ID: d.ID,
		Name: d.Name,
		Year: +d.Year,
		Time: d.Time,
		Date: convertDate(d.Date),
		Event: d.Event,
		Status: d.Status,
		Latitude: +d.Latitude,
		Longtitude: +d.Longtitude,
		MPH: +d.MPH,
		Knots: +d.Knots,
		Category: d.Category
	};
}

function convertDate(dateStr) {
	const parts = dateStr.split('/');
	let year = parseInt(parts[2], 10);

	// Adjust for two-digit year (assuming 20th century)
	if (year < 100) {
		year += 1900;
	}

	const month = parts[0].padStart(2, '0');
	const day = parts[1].padStart(2, '0');

	return `${month}/${day}/${year}`;
}

function prepAggregateData(data) {
	data.forEach((d) => {
		d.Type = +d.Category >= 3 ? 'major' : 'minor';
	});
	// console.log({ data });

	const aggregateByID = d3.rollups(
		data,
		(v) => (v.some((d) => d.Type === 'major') ? 'major' : 'minor'),
		(d) => d.ID
	);
	// console.log({ aggregateByID });
	// console.log(new Map(aggregateByID));

	const interimData = data.map((d) => ({
		Year: d.Year,
		ID: d.ID,
		Type: new Map(aggregateByID).get(d.ID)
	}));
	// console.log({ interimData });

	const interimData2 = interimData.reduce((acc, curr) => {
		if (!acc.some((item) => item.ID === curr.ID)) {
			acc.push(curr); // If not, add the current item to the accumulator
		}
		return acc;
	}, []);
	// console.log({ interimData2 });

	const interimData3 = d3
		.rollups(
			interimData2,
			(v) => ({
				total_count: v.length,
				minor_count: v.filter((d) => d.Type === 'minor').length,
				major_count: v.filter((d) => d.Type === 'major').length
			}),
			(d) => d.Year
		)
		.map(([year, counts]) => ({
			year: year,
			...counts
		}));
	// console.log({ interimData3 });

	const yearMin = d3.min(interimData3, (d) => d.year);
	const yearMax = d3.max(interimData3, (d) => d.year);

	const aggregateData = [...interimData3];
	for (let year = yearMin; year <= yearMax - 1; year++) {
		if (!aggregateData.some((d) => d.year === year)) {
			aggregateData.push({
				year: year,
				total_count: 0,
				minor_count: 0,
				major_count: 0
			});
		}
	}
	aggregateData.sort((a, b) => d3.ascending(a.year, b.year));
	// console.log({ aggregateData });

	return aggregateData;
}

export const ssr = false;
