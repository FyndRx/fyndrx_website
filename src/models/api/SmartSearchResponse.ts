export interface SmartSearchMatch {
    type: 'product' | 'brand' | 'category' | 'drug';
    confidence: number;
    action: 'navigate' | 'list';
    target: string;
    data: any;
}

export interface SmartSearchResultsGroup {
    products: any[];
    brands: any[];
    generics: any[]; // drug matches
    categories: any[];
}

export interface SmartSearchSuggestion {
    text: string;
    type: string;
}

export interface SmartSearchResponse {
    query: string;
    top_match?: SmartSearchMatch;
    results: SmartSearchResultsGroup;
    suggestions: SmartSearchSuggestion[];
}
