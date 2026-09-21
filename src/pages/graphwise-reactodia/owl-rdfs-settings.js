// A copy of Reactodia's `OwlRdfsSettings` preset (`src/data/sparql/sparqlDataProviderSettings.ts` in the
// reactodia-workspace fork), which the demo page passes to the wrapper as its `providerSettings`. The wrapper
// requires the host to pass the settings, and this plain script can't import them from `@reactodia/workspace`.
// Keep it in sync with the fork: `RDF_SETTINGS` mirrors `RdfSettings`, `OWL_RDFS_SETTINGS_OVERRIDE` mirrors
// `OwlRdfsSettingsOverride`.

const RDF_SETTINGS = {
  linkConfigurations: [],
  openWorldLinks: false,

  propertyConfigurations: [],
  openWorldProperties: false,

  linksInfoQuery: `SELECT ?source ?type ?target
      WHERE {
        \${linkConfigurations}
        VALUES (?source) {\${sourceIris}}
        VALUES (?target) {\${targetIris}}
      }`,

  defaultPrefix: '',

  schemaLabelProperty: 'rdfs:label',
  dataLabelProperty: 'rdfs:label',

  fullTextSearch: {
    prefix: '',
    queryPattern: '',
  },

  classTreeQuery: '',

  classInfoQuery:
`SELECT ?class ?label ?instcount WHERE {
  VALUES(?class) {\${ids}}
  OPTIONAL {
    ?class \${schemaLabelProperty} ?label
    \${labelLanguageFilter}
  }
  BIND("" as ?instcount)
}`,

  linkTypesQuery:
`SELECT DISTINCT ?link ?instcount ?label WHERE {
  \${linkTypesPattern}
  OPTIONAL {
    ?link \${schemaLabelProperty} ?label
    \${labelLanguageFilter}
  }
}`,

  linkTypesPattern: '',

  linkTypesInfoQuery:
`SELECT ?link ?label WHERE {
  VALUES(?link) {\${ids}}
  OPTIONAL {
    ?link \${schemaLabelProperty} ?label
    \${labelLanguageFilter}
  }
}`,

  propertyInfoQuery:
`SELECT ?property ?label WHERE {
  VALUES(?property) {\${ids}}
  OPTIONAL {
    ?property \${schemaLabelProperty} ?label
    \${labelLanguageFilter}
  }
}`,

  elementInfoQuery: '',
  imageQueryPattern: '',

  linkTypesOfQuery: '',
  linkTypesStatisticsQuery: '',

  lookupQuery:
`SELECT \${outerProjection} WHERE {
  \${filterInnerPrelude}
  {
    SELECT DISTINCT \${innerProjection} WHERE {
      \${filterByType}
      \${filterByRefElementLink}
      \${filterByText}
      \${filterAdditionalRestriction}
    } \${orderBy} \${limit}
  }
  \${queryTypes}
  \${queryElementInfo}
} \${orderBy}`,

  filterRefElementLinkPattern: '',
  filterTypePattern: '',
  filterAdditionalRestriction: '',
  filterElementInfoPattern: '',
};

const OWL_RDFS_SETTINGS_OVERRIDE = {
  defaultPrefix:
    `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
`,
  schemaLabelProperty: 'rdfs:label',
  dataLabelProperty: 'rdfs:label',
  fullTextSearch: {
    prefix: '',
    queryPattern:
    `?inst \${dataLabelProperty} ?search1
    FILTER regex(COALESCE(str(?search1)), "\${text}", "i")
    BIND(0 as ?score)
`,
    extractLabel: true,
  },
  classTreeQuery: `
    SELECT ?class ?label ?parent
    WHERE {
      {
        ?class a rdfs:Class
      } UNION {
        ?class a owl:Class
      }
      FILTER ISIRI(?class)
      OPTIONAL {
        ?class rdfs:label ?label
        \${labelLanguageFilter}
      }
      OPTIONAL {?class rdfs:subClassOf ?parent. FILTER ISIRI(?parent)}
    }
  `,

  // todo: think more, maybe add a limit here?
  linkTypesPattern: `
    { ?link a rdf:Property }
    UNION
    { ?link a owl:ObjectProperty }
    BIND('' as ?instcount)
  `,
  elementInfoQuery: `
    CONSTRUCT {
      ?inst <urn:reactodia:sparql:type> ?class .
      ?inst <urn:reactodia:sparql:label> ?label .
      ?inst ?propType ?propValue.
    } WHERE {
      VALUES (?inst) {\${ids}}
      OPTIONAL { ?inst a ?class }
      OPTIONAL {
        ?inst \${dataLabelProperty} ?label
        \${labelLanguageFilter}
      }
      OPTIONAL {
        \${propertyConfigurations}
        FILTER (isLiteral(?propValue))
        \${valueLanguageFilter}
      }
    }
  `,
  imageQueryPattern: '{ ?inst ?linkType ?image } UNION { [] ?linkType ?inst. BIND(?inst as ?image) }',
  linkTypesOfQuery: `
    SELECT DISTINCT ?link ?direction
    WHERE {
      \${linkConfigurations}
    }
  `,
  linkTypesStatisticsQuery: `
    SELECT ?link ?outCount ?inCount
    WHERE {
      {
        SELECT (\${linkId} as ?link) (count(?outObject) as ?outCount) WHERE {
          \${linkConfigurationOut}
          \${navigateElementFilterOut}
        } LIMIT 101
      } {
        SELECT (\${linkId} as ?link) (count(?inObject) as ?inCount) WHERE {
          \${linkConfigurationIn}
          \${navigateElementFilterIn}
        } LIMIT 101
      }
    }
  `,
  filterRefElementLinkPattern: '',
  filterTypePattern: '?inst a ?instType. ?instType rdfs:subClassOf* ?class',
  filterElementInfoPattern: `
    OPTIONAL {?inst rdf:type ?foundClass}
    BIND (coalesce(?foundClass, owl:Thing) as ?class)
    OPTIONAL {
      ?inst \${dataLabelProperty} ?label
      \${labelLanguageFilter}
    }
  `,
  filterAdditionalRestriction: '',
};

const OWL_RDFS_SETTINGS = {...RDF_SETTINGS, ...OWL_RDFS_SETTINGS_OVERRIDE};
