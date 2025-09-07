/* eslint-disable import-x/unambiguous */

/**
 * Removes the first occurrence of a substring from the string.
 * @param {string} substring The substring to remove.
 * @returns {string} The string with the first occurrence of the substring removed.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!String.prototype.without) {

	String.prototype.without = function(
		this: string,
		substring: string
	): string {

		return this.replace(
			substring,
			''
		);

	};

}

/**
 * Removes all occurrences of a substring from the string.
 * @param {string} substring The substring to remove.
 * @returns {string} The string with all occurrences of the substring removed.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!String.prototype.withoutAll) {

	String.prototype.withoutAll = function(
		this: string,
		substring: string
	): string {

		return this.replaceAll(
			substring,
			''
		);

	};

}
