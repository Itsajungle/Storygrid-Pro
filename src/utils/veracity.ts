
import { FactCheckResult, VeracityType, SourceReference } from '@/types/veracity';
import { v4 as uuidv4 } from 'uuid';

// Confidence level ratings for fact checking (0-100)
export const CONFIDENCE_LEVELS = {
  HIGH: 90,
  MEDIUM: 70,
  LOW: 50,
  UNCERTAIN: 30
};

export const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= CONFIDENCE_LEVELS.HIGH) return 'High Confidence';
  if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return 'Medium Confidence';
  if (confidence >= CONFIDENCE_LEVELS.LOW) return 'Low Confidence';
  return 'Uncertain';
};

// In a real implementation, this would connect to the Perplexity API
// For now, we'll use mock data to demonstrate the functionality
export const performFactCheck = async (
  content: string,
  includeToneCheck: boolean
): Promise<FactCheckResult[]> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const results: FactCheckResult[] = [];
  
  // Enhanced health claims detection patterns with scientific specificity
  const healthClaimsPatterns = [
    {
      pattern: /vitamin\s+[A-Z]\s+(?:helps|aids|boosts|improves|prevents|treats|cures|enhances|supports)/i,
      issue: "Possible vitamin benefit overstatement",
      citationSummary: "Research on specific vitamin benefits varies widely by context, dosage, and individual health factors.",
      confidence: CONFIDENCE_LEVELS.MEDIUM,
      suggestion: "Consider specifying 'may help support' with references to specific research studies",
      sources: [
        {
          title: "NIH: Vitamin Fact Sheets",
          url: "https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/",
          source: "NIH"
        },
        {
          title: "Mayo Clinic: Supplements",
          url: "https://www.mayoclinic.org/drugs-supplements",
          source: "Mayo Clinic"
        }
      ]
    },
    {
      pattern: /(?:boosts?|increases?|raises?|elevates?|enhances?)\s+(?:serotonin|dopamine|endorphins|oxytocin|neurotransmitters)/i,
      issue: "Simplified neurotransmitter claim",
      citationSummary: "Neurotransmitter activity is complex and rarely 'boosted' in the simplistic way often described in wellness content.",
      confidence: CONFIDENCE_LEVELS.HIGH,
      suggestion: "Consider more nuanced language about how activities may be associated with mood changes",
      sources: [
        {
          title: "Harvard Medical School: Mood and Food",
          url: "https://www.health.harvard.edu/mind-and-mood/food-and-mood-is-there-a-connection",
          source: "Harvard Medical School"
        },
        {
          title: "Neurotransmitters and mood regulation",
          url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2077351/",
          source: "PubMed"
        }
      ]
    },
    {
      pattern: /(?:superfood|superfoods)/i,
      issue: "'Superfood' is a marketing term without scientific definition",
      citationSummary: "No standardized criteria exist to classify foods as 'superfoods' in scientific or regulatory contexts.",
      confidence: CONFIDENCE_LEVELS.HIGH,
      suggestion: "Consider describing specific nutritional benefits instead of using 'superfood'",
      sources: [
        {
          title: "Harvard School of Public Health: Superfoods or Superhype?",
          url: "https://www.hsph.harvard.edu/nutritionsource/superfoods/",
          source: "Harvard"
        },
        {
          title: "European Food Information Council on Superfoods",
          url: "https://www.eufic.org/en/healthy-living/article/the-science-behind-superfoods-are-they-really-super",
          source: "EUFIC"
        }
      ]
    },
    {
      pattern: /(?:detoxes?|detoxify|detoxification|cleanse|cleansing) (?:your body|the body|organs|liver|kidney|blood)/i,
      issue: "Unsupported detox/cleanse claim",
      citationSummary: "The body has built-in detoxification systems (liver, kidneys); external 'detox' products typically lack scientific evidence.",
      confidence: CONFIDENCE_LEVELS.HIGH,
      suggestion: "Consider focusing on specific health benefits of whole foods without detox terminology",
      sources: [
        {
          title: "Harvard Health: The dubious practice of detox",
          url: "https://www.health.harvard.edu/staying-healthy/the-dubious-practice-of-detox",
          source: "Harvard Health"
        },
        {
          title: "NIH on 'Detoxes' and 'Cleanses'",
          url: "https://www.nccih.nih.gov/health/detoxes-and-cleanses-what-you-need-to-know",
          source: "NIH"
        }
      ]
    },
    {
      pattern: /(?:plant|vegetable) proteins? (?:are|is) incomplete/i,
      issue: "Oversimplified protein quality claim",
      citationSummary: "While individual plant proteins may have lower amounts of certain amino acids, varied plant protein sources can provide complete nutrition.",
      confidence: CONFIDENCE_LEVELS.HIGH,
      suggestion: "Consider more nuanced language about varied plant protein sources forming complete nutrition patterns",
      sources: [
        {
          title: "American Society for Nutrition: Protein Complementation",
          url: "https://nutrition.org/protein-complementation/",
          source: "ASN"
        },
        {
          title: "The protein myth: why plant protein is complete",
          url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6893534/",
          source: "PubMed"
        }
      ]
    },
    {
      pattern: /(?:8|eight) hours of sleep is (?:ideal|perfect|needed|required|recommended|optimal)/i,
      issue: "Oversimplified sleep recommendation",
      citationSummary: "Sleep needs vary by age, individual factors, and health conditions; the 8-hour rule is a generalization.",
      confidence: CONFIDENCE_LEVELS.MEDIUM,
      suggestion: "Consider mentioning sleep range recommendations by age from CDC or sleep research organizations",
      sources: [
        {
          title: "CDC Sleep Recommendations by Age",
          url: "https://www.cdc.gov/sleep/about_sleep/how_much_sleep.html",
          source: "CDC"
        },
        {
          title: "National Sleep Foundation Guidelines",
          url: "https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need",
          source: "Sleep Foundation"
        }
      ]
    },
    {
      pattern: /sunlight (?:boosts|increases|raises|elevates|enhances) serotonin/i,
      issue: "Simplified sunlight-serotonin relationship",
      citationSummary: "While sunlight exposure is associated with improved mood and may influence serotonin pathways, the mechanism is complex and varies by individual.",
      confidence: CONFIDENCE_LEVELS.MEDIUM,
      suggestion: "Consider mentioning that research supports an association between sunlight exposure and mood regulation through multiple pathways",
      sources: [
        {
          title: "Sunshine, Serotonin, and Mood",
          url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2077351/",
          source: "PubMed"
        },
        {
          title: "NIH Light Therapy for Depression",
          url: "https://www.nimh.nih.gov/health/topics/seasonal-affective-disorder",
          source: "NIH"
        }
      ]
    },
    {
      pattern: /(?:cures?|treats?|prevents?|eliminates?) (?:cancer|diabetes|heart disease|alzheimer|dementia)/i,
      issue: "Medical claim requires FDA substantiation",
      citationSummary: "Claims about treating, curing, or preventing serious diseases require rigorous clinical trial evidence and regulatory approval.",
      confidence: CONFIDENCE_LEVELS.HIGH,
      suggestion: "Consider rephrasing to discuss 'potential benefits' or 'associated with reduced risk' with appropriate citations",
      sources: [
        {
          title: "FDA: Health Fraud Scams",
          url: "https://www.fda.gov/consumers/health-fraud-scams",
          source: "FDA"
        },
        {
          title: "FTC on Health Claims",
          url: "https://www.ftc.gov/news-events/topics/truth-advertising/health-claims",
          source: "FTC"
        }
      ]
    }
  ];
  
  // Scan for health claims
  healthClaimsPatterns.forEach(claim => {
    const matches = [...content.matchAll(new RegExp(claim.pattern, 'gi'))];
    
    matches.forEach(match => {
      if (match.index !== undefined) {
        const start = match.index;
        const end = start + match[0].length;
        
        results.push({
          id: uuidv4(),
          type: 'fact',
          issue: claim.issue,
          flaggedText: match[0],
          position: { start, end },
          suggestion: claim.suggestion,
          sources: claim.sources,
          confidenceRating: claim.confidence,
          citationSummary: claim.citationSummary
        });
      }
    });
  });
  
  // Add tone checks if enabled
  if (includeToneCheck) {
    const toneIssuesPatterns = [
      {
        pattern: /obviously|clearly|everyone knows/i,
        issue: "Potentially dismissive language",
        citationSummary: "Presumptive language may alienate audience members with different knowledge levels or perspectives.",
        confidence: CONFIDENCE_LEVELS.MEDIUM,
        suggestion: "Consider removing or rephrasing to be more inclusive of different knowledge levels"
      },
      {
        pattern: /men and wives|mankind|manpower|man-made/i,
        issue: "Potentially gendered language",
        citationSummary: "Style guides including APA, Chicago, and most media organizations recommend gender-inclusive language.",
        confidence: CONFIDENCE_LEVELS.MEDIUM,
        suggestion: "Consider using more inclusive terms like 'people', 'humanity', 'workforce', or 'artificial'"
      },
      {
        pattern: /miracle|amazing|incredible|revolutionary/i,
        issue: "Promotional language may come across as unbalanced",
        citationSummary: "Hyperbolic language can reduce credibility in scientific or health content.",
        confidence: CONFIDENCE_LEVELS.LOW,
        suggestion: "Consider more neutral descriptive language based on specific attributes or benefits"
      }
    ];
    
    toneIssuesPatterns.forEach(issue => {
      const matches = [...content.matchAll(new RegExp(issue.pattern, 'gi'))];
      
      matches.forEach(match => {
        if (match.index !== undefined) {
          const start = match.index;
          const end = start + match[0].length;
          
          results.push({
            id: uuidv4(),
            type: 'tone',
            issue: issue.issue,
            flaggedText: match[0],
            position: { start, end },
            suggestion: issue.suggestion,
            confidenceRating: issue.confidence,
            citationSummary: issue.citationSummary
          });
        }
      });
    });
  }
  
  return results;
};
