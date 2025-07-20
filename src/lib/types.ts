export type BreakdownItem = {
	term: string;
	grouping: string;
	literal?: string;
	conceptual: string;
	children?: BreakdownItem[];
};

export interface Explanation {
	grouping: string;
	breakdown: BreakdownItem[];
	translation: string;
}
