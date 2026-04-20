import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicineSearchService {
  private readonly FDA_URL = 'https://api.fda.gov/drug/label.json';

  // Common medicine name mappings (different countries use different names)
  private readonly medicineNameMappings: { [key: string]: string[] } = {
    paracetamol: ['acetaminophen', 'tylenol'],
    acetaminophen: ['paracetamol', 'tylenol'],
    ibuprofen: ['advil', 'motrin', 'brufen'],
    diclofenac: ['voltaren', 'diclo'],
    amoxicillin: ['amoxycillin'],
    cephalexin: ['cephalin', 'keflex'],
    metformin: ['glucophage'],
    atorvastatin: ['lipitor'],
    omeprazole: ['prilosec', 'losec'],
    ranitidine: ['zantac'],
    cetirizine: ['zyrtec', 'piriteze'],
    loratadine: ['claritin', 'claratyne'],
    aspirin: ['acetylsalicylic acid', 'asa'],
    pseudoephedrine: ['sudafed'],
    phenylephrine: ['neo-synephrine'],
  };

  async search(query: string): Promise<{ results: any[]; suggestions?: string[] }> {
    const lowerQuery = query.toLowerCase();

    try {
      // Build search queries - try exact match first, then wildcards
      const searchQueries: string[] = [];
      
      // Exact matches (highest priority)
      searchQueries.push(`openfda.brand_name:"${query}"`);
      searchQueries.push(`generic_name:"${query}"`);
      searchQueries.push(`active_ingredient:"${query}"`);
      
      // Case-insensitive exact matches
      searchQueries.push(`openfda.brand_name:"${lowerQuery}"`);
      searchQueries.push(`generic_name:"${lowerQuery}"`);
      
      // Wildcard searches (match anything starting with query)
      searchQueries.push(`openfda.brand_name:${query}*`);
      searchQueries.push(`generic_name:${query}*`);
      searchQueries.push(`active_ingredient:${query}*`);
      
      // If there are medicine name mappings, search for those too
      if (this.medicineNameMappings[lowerQuery]) {
        this.medicineNameMappings[lowerQuery].forEach((alt) => {
          searchQueries.push(`openfda.brand_name:"${alt}"`);
          searchQueries.push(`generic_name:"${alt}"`);
          searchQueries.push(`openfda.brand_name:${alt}*`);
          searchQueries.push(`generic_name:${alt}*`);
        });
      }

      // Try each search query and combine results
      const allResults: any[] = [];
      const seenMedicines = new Set();

      for (const searchQuery of searchQueries) {
        try {
          const response = await axios.get(this.FDA_URL, {
            params: {
              search: searchQuery,
              limit: 5,
            },
          });

          if (response.data.results && response.data.results.length > 0) {
            response.data.results.forEach((item: any) => {
              const brandName = item.openfda?.brand_name?.[0] || item.generic_name?.[0] || 'Unknown';
              if (!seenMedicines.has(brandName)) {
                seenMedicines.add(brandName);
                allResults.push(this.formatMedicineResult(item));
              }
            });
          }
        } catch (err) {
          // Continue to next search query if one fails
          continue;
        }
      }

      const topResults = allResults.slice(0, 10);

      // If no results found, try to get suggestions
      if (topResults.length === 0) {
        const suggestions = await this.getSuggestions(query);
        return { results: [], suggestions };
      }

      return { results: topResults };
    } catch (error) {
      console.error('Medicine search error:', error);
      return { results: [] };
    }
  }

  /**
   * Get suggestions for a query - tries alternative names and partial matches
   */
  private async getSuggestions(query: string): Promise<string[]> {
    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];
    const seenSuggestions = new Set();

    try {
      // First, try medicine name mappings (alternative names)
      if (this.medicineNameMappings[lowerQuery]) {
        const alternatives = this.medicineNameMappings[lowerQuery];
        
        // Search for each alternative
        for (const alt of alternatives) {
          try {
            const response = await axios.get(this.FDA_URL, {
              params: {
                search: `openfda.brand_name:"${alt}" OR generic_name:"${alt}"`,
                limit: 3,
              },
            });

            if (response.data.results) {
              response.data.results.forEach((item: any) => {
                const name = item.openfda?.brand_name?.[0] || item.generic_name?.[0];
                if (name && !seenSuggestions.has(name)) {
                  seenSuggestions.add(name);
                  suggestions.push(name);
                }
              });
            }
          } catch (err) {
            continue;
          }
        }

        // If we found alternatives, return them
        if (suggestions.length > 0) {
          return suggestions.slice(0, 5);
        }
      }

      // Try broader wildcard searches to find similar medicines
      const broadSearches = [
        `openfda.brand_name:${query}*`,
        `generic_name:${query}*`,
      ];

      for (const search of broadSearches) {
        try {
          const response = await axios.get(this.FDA_URL, {
            params: {
              search,
              limit: 10,
            },
          });

          if (response.data.results) {
            response.data.results.forEach((item: any) => {
              const brandNames = item.openfda?.brand_name || [];
              const genericNames = item.generic_name || [];

              brandNames.forEach((name: string) => {
                if (!seenSuggestions.has(name) && this.calculateSimilarity(query, name) > 0.5) {
                  seenSuggestions.add(name);
                  suggestions.push(name);
                }
              });

              genericNames.forEach((name: string) => {
                if (!seenSuggestions.has(name) && this.calculateSimilarity(query, name) > 0.5) {
                  seenSuggestions.add(name);
                  suggestions.push(name);
                }
              });
            });
          }
        } catch (err) {
          continue;
        }
      }

      return suggestions.slice(0, 5); // Return top 5 suggestions
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   * Returns a value between 0 and 1 (1 = identical, 0 = completely different)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }

    return costs[s2.length];
  }

  private formatMedicineResult(item: any) {
    const genericNames = item.generic_name || [];
    const brandNames = item.openfda?.brand_name || [];
    const activeIngredients = item.active_ingredient || [];
    
    return {
      name: brandNames[0] || genericNames[0] || 'Unknown Medicine',
      brandNames: brandNames.join(', ') || 'N/A',
      genericName: genericNames.join(', ') || 'N/A',
      commonNames: this.extractCommonNames(item),
      chemicalName: this.extractChemicalName(item),
      manufacturer: item.openfda?.manufacturer_name?.[0] || 'N/A',
      purpose: item.purpose?.[0] || 'N/A',
      description: this.getDescription(item),
      dosage: item.dosage_and_administration?.[0] || 'N/A',
      activeIngredient: activeIngredients.join(', ') || 'N/A',
      indication: item.indications_and_usage?.[0] || 'N/A',
      route: item.route_of_administration?.[0] || 'N/A',
      warnings: item.warnings?.[0] || item.contraindications?.[0] || 'N/A',
      sideEffects: item.adverse_reactions?.[0] || 'N/A',
      storageConditions: item.storage_and_handling?.[0] || 'N/A',
      formAndStrength: item.dosage_forms_and_strengths?.[0] || 'N/A',
    };
  }

  private extractCommonNames(item: any): string {
    // Common names might be in different fields
    const commonNames = [];
    
    if (item.openfda?.brand_name) {
      commonNames.push(...item.openfda.brand_name);
    }
    if (item.openfda?.brand_name_combinations) {
      commonNames.push(...item.openfda.brand_name_combinations);
    }
    
    return commonNames.slice(0, 5).join(', ') || 'N/A';
  }

  private extractChemicalName(item: any): string {
    // Chemical name might be in active ingredient or description
    if (item.active_ingredient) {
      return item.active_ingredient[0] || 'N/A';
    }
    if (item.description) {
      const desc = item.description[0];
      // Extract chemical structure or IUPAC name if available
      if (desc && desc.length > 0) {
        return desc.substring(0, 200);
      }
    }
    return 'N/A';
  }

  private getDescription(item: any): string {
    // Compile a comprehensive description
    const parts = [];

    // Purpose
    if (item.purpose?.[0]) {
      parts.push(`Purpose: ${item.purpose[0]}`);
    }

    // Indication
    if (item.indications_and_usage?.[0]) {
      parts.push(`Indication: ${item.indications_and_usage[0]}`);
    }

    // Description
    if (item.description?.[0]) {
      parts.push(`Description: ${item.description[0]}`);
    }

    // How supplied
    if (item.how_supplied?.[0]) {
      parts.push(`How Supplied: ${item.how_supplied[0]}`);
    }

    return parts.join(' | ') || 'No description available';
  }

  async getDetails(name: string) {
    try {
      const response = await axios.get(this.FDA_URL, {
        params: {
          search: `openfda.brand_name:"${name}"`,
          limit: 1,
        },
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return this.formatMedicineResult(response.data.results[0]);
      }
      
      throw new HttpException('Medicine details not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      throw new HttpException('Medicine details not found', HttpStatus.NOT_FOUND);
    }
  }
}
