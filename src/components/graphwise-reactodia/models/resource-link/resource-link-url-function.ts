/**
 * Returns the URL a node's resource link leads to.
 *
 * @param iri The IRI of the node's resource.
 * @returns The URL of the resource link.
 */
export type ResourceLinkUrlFunction = (iri: string) => string;
