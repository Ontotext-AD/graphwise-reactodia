import {DefaultDataLocaleProvider, isEncodedBlank, WorkspaceContext} from '@reactodia/workspace';
import {ResourceLinkUrlFunction} from '../models/resource-link/resource-link-url-function';
import type {ReactodiaConfig} from '../models/reactodia-config';

/**
 * A data locale provider whose resource links lead where the host decides.
 */
export class ResourceLinkLocaleProvider extends DefaultDataLocaleProvider {
  private readonly getResourceLinkUrl?: ResourceLinkUrlFunction;

  /**
   * @param context The workspace context, which provides the model and the translation.
   * @param getResourceLinkUrl See {@link ReactodiaConfig.getResourceLinkUrl}.
   */
  constructor(context: WorkspaceContext, getResourceLinkUrl?: ResourceLinkUrlFunction) {
    super({model: context.model, translation: context.translation});
    this.getResourceLinkUrl = getResourceLinkUrl;
  }

  /**
   * Provides the anchor props of a resource link, with the `href` from the host's callback.
   *
   * @param targetIri The IRI of the node's resource.
   * @returns The anchor props; the fork's defaults for a blank node or without a callback.
   */
  override prepareAnchor(targetIri: string): ReturnType<DefaultDataLocaleProvider['prepareAnchor']> {
    const anchor = super.prepareAnchor(targetIri);
    if (!this.getResourceLinkUrl || isEncodedBlank(targetIri)) {
      return anchor;
    }
    return {...anchor, href: this.getResourceLinkUrl(targetIri)};
  }
}
