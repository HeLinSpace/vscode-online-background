/**
 * CategoryItem
 */
export class CategoryItem {

	sourceName: string;
	baseUrl: string;
	imgUrlKey: string;
	category: string;
	parameters: string;

	constructor(sourceName: string, baseUrl: string, imgUrlKey: string, category: string, parameters: string) {
		this.sourceName = sourceName;
		this.baseUrl = baseUrl;
		this.imgUrlKey = imgUrlKey;
		this.category = category;
		this.parameters = parameters;
	}
}