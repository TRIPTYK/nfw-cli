/**
 * Generate a string with numbers and letters.
 * @param length Length of the returned string.
 * @returns the generated string.
 */
export function strRandom(length = 10) {
	let final = "";
	for(let i = 0; i<length; i++) {
		final += Math.random().toString(36).substr(2, 1);
		if(Math.floor(Math.random() * 2)%2 == 0) 
			final = final.replace(/.$/, final.slice(-1).toUpperCase());	
	}	
	return final;
}
