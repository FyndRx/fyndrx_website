import type { PaginationMeta } from './ApiResponse';

export interface SmartSearchProduct {
    id: number;
    name: string;
    detail: string;
    brand: string;
    brand_id: number;
    drug: string;
    form: string;
    form_id: number;
    strength: string;
    strength_id: number;
    uom: string;
    uom_id: number;
    image: string | null;
    requires_prescription: boolean;
    pharmacy_count: number;
    url: string;
    price?: number;
    discount_price?: number;
}

export interface SmartSearchGeneric {
    id: number;
    name: string;
    variants_count: number;
    url: string;
}

export interface SmartSearchMatch {
    type: 'product' | 'brand' | 'category' | 'drug';
    confidence: number;
    action: 'navigate' | 'list';
    target: string;
    data: any;
}

export interface SmartSearchResultsGroup {
    products: SmartSearchProduct[];
    brands: any[];
    generics: SmartSearchGeneric[];
    categories: any[];
}

export interface SmartSearchSuggestion {
    text: string;
    type: string;
}

/**
 * Grouped structure returned when a query parameter 'q' is provided.
 */
export interface SmartSearchResponse {
    query: string;
    top_match?: SmartSearchMatch;
    results: SmartSearchResultsGroup;
    suggestions: SmartSearchSuggestion[];
}

/**
 * Paginated structure returned when NO query parameter is provided.
 * This represents the "Discovery/Featured" mode of the endpoint.
 */
export interface PaginatedSmartSearchResponse {
    data: SmartSearchProduct[];
    meta: PaginationMeta;
}
