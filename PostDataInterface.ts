// make_types -i PostDataInterface.ts 2019-1-19_0_test.json PostData
export interface PostData {
  data?: (DataEntity)[] | null;
  included?: (IncludedEntity)[] | null;
  links: CursorsOrLinks;
  meta: Meta;
}
export interface DataEntity {
  attributes: Attributes;
  id: string;
  relationships: Relationships;
  type: string;
}
export interface Attributes {
  change_visibility_at?: string | null;
  comment_count: number;
  content: string;
  current_user_can_delete: boolean;
  current_user_can_view: boolean;
  current_user_has_liked: boolean;
  embed?: Embed | null;
  image?: Image | null;
  is_paid: boolean;
  like_count: number;
  min_cents_pledged_to_view?: number | null;
  patreon_url: string;
  patron_count?: number | null;
  pledge_url: string;
  post_file?: PostFile | null;
  post_type: string;
  published_at: string;
  teaser_text?: null;
  title: string;
  upgrade_url: string;
  url: string;
}
export interface Embed {
  description: string;
  html: string;
  provider: string;
  provider_url: string;
  subject: string;
  url: string;
}
export interface Image {
  height: number;
  large_url: string;
  thumb_url: string;
  url: string;
  width: number;
}
export interface PostFile {
  name: string;
  url: string;
}
export interface Relationships {
  access_rules: AccessRulesOrUserDefinedTagsOrChoices;
  attachments: AttachmentsOrCurrentUserResponses;
  campaign: CampaignOrPollOrUserOrTier;
  poll: PollOrTier;
  user: CampaignOrPollOrUserOrTier;
  user_defined_tags: AccessRulesOrUserDefinedTagsOrChoices;
}
export interface AccessRulesOrUserDefinedTagsOrChoices {
  data?: (DataEntityOrData)[] | null;
}
export interface DataEntityOrData {
  id: string;
  type: string;
}
export interface AttachmentsOrCurrentUserResponses {
  data?: (null)[] | null;
}
export interface CampaignOrPollOrUserOrTier {
  data: DataEntityOrData;
  links: Links;
}
export interface Links {
  related: string;
}
export interface PollOrTier {
  data?: DataEntityOrData1 | null;
  links?: Links1 | null;
}
export interface DataEntityOrData1 {
  id: string;
  type: string;
}
export interface Links1 {
  related: string;
}
export interface IncludedEntity {
  attributes: Attributes1;
  id: string;
  type: string;
  relationships?: Relationships1 | null;
}
export interface Attributes1 {
  full_name?: string | null;
  image_url?: string | null;
  url?: string | null;
  earnings_visibility?: string | null;
  is_monthly?: boolean | null;
  is_nsfw?: boolean | null;
  closes_at?: null;
  created_at?: string | null;
  num_responses?: number | null;
  question_text?: string | null;
  question_type?: string | null;
  background_image_url?: null;
  cardinality?: number | null;
  is_featured?: boolean | null;
  ordinal_number?: null;
  tag_type?: string | null;
  value?: string | null;
  access_rule_type?: string | null;
  amount_cents?: number | null;
  post_count?: number | null;
  choice_type?: string | null;
  position?: number | null;
  text_content?: string | null;
  amount?: number | null;
  description?: string | null;
  discord_role_ids?: (string)[] | null;
  edited_at?: string | null;
  patron_count?: number | null;
  published?: boolean | null;
  published_at?: string | null;
  remaining?: null;
  requires_shipping?: boolean | null;
  title?: string | null;
  unpublished_at?: null;
  user_limit?: null;
}
export interface Relationships1 {
  choices?: AccessRulesOrUserDefinedTagsOrChoices1 | null;
  current_user_responses?: AttachmentsOrCurrentUserResponses1 | null;
  tier?: PollOrTier1 | null;
}
export interface AccessRulesOrUserDefinedTagsOrChoices1 {
  data?: (DataEntityOrData)[] | null;
}
export interface AttachmentsOrCurrentUserResponses1 {
  data?: (null)[] | null;
}
export interface PollOrTier1 {
  data?: DataEntityOrData1 | null;
  links?: Links1 | null;
}
export interface CursorsOrLinks {
  next: string;
}
export interface Meta {
  pagination: Pagination;
}
export interface Pagination {
  cursors: CursorsOrLinks;
  total: number;
}
