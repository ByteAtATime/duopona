export interface BreakdownItem {
	term: string;
	literal: string;
	conceptual: string;
}

export interface Explanation {
	grouping: string;
	breakdown: BreakdownItem[];
	translation: string;
}
