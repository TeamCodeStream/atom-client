import { Range } from "atom";

// Convert CodeStream 1-based flat-array location into Atom's 0-based Range
export function locationToRange(location) {
	location = location.map(index => (index != undefined ? index - 1 : index));
	const pointA = [location[0], location[1]];
	const pointB = [location[2], location[3]];
	const range = new Range(pointA, pointB);
	return range;
}

// Convert Atom's 0-based Range into CodeStream 1-based flat-array location
export function rangeToLocation(range) {
	let location = [range.start.row, range.start.column, range.end.row, range.end.column];
	location = location.map(index => (index != undefined ? index + 1 : index));
	return location;
}

export function areEqualLocations(loc1, loc2) {
	return loc1[0] === loc2[0] && loc1[1] === loc2[1] && loc1[2] === loc2[2] && loc1[3] === loc2[3];
}
