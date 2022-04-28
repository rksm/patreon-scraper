import { Comments } from "./Comments";

// make_types -i PostDataInterface.ts 2019-1-19_0_test.json PostData
export interface PostData {
  data?: DataEntity[] | null;
  included?: IncludedEntity[] | null;
  links: CursorsOrLinks;
  meta: Meta;
}
export interface DataEntity {
  attributes: Attributes;
  id: string;
  relationships: Relationships;
  type: string;
  comments?: Comments;
}
export interface Attributes {
  change_visibility_at?: string | null;
  comment_count: number;
  content: string;
  current_user_can_comment: boolean;
  current_user_can_delete: boolean;
  current_user_can_view: boolean;
  current_user_has_liked: boolean;
  embed?: Embed | null;
  has_ti_violation?: boolean | null;
  image?: Image | null;
  is_paid: boolean;
  like_count: number;
  meta_image_url?: string;
  min_cents_pledged_to_view?: number | null;
  patreon_url: string;
  patron_count?: number | null;
  pledge_url: string;
  post_file?: PostFile | null;
  post_metadata?: PostMetadata | null;
  post_type: string;
  published_at: string;
  teaser_text?: string | null;
  title: string;
  upgrade_url: string;
  url: string;
}
export interface PostMetadata {
  image_order?: string[] | null;
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
  duration_s: number;
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
  data?: DataEntityOrData[] | null;
}
export interface DataEntityOrData {
  id: string;
  type: string;
}
export interface AttachmentsOrCurrentUserResponses {
  data?: null[] | null;
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
  access_rule_type?: string | null;
  amount?: number | null;
  amount_cents?: number | null;
  avatar_photo_url?: string | null;
  background_image_url?: null;
  cardinality?: number | null;
  choice_type?: string | null;
  closes_at?: null;
  created_at?: string | null;
  currency?: string | null;
  description?: string | null;
  discord_role_ids?: string[] | null;
  download_url?: string | null;
  earnings_visibility?: string | null;
  edited_at?: string | null;
  file_name?: string | null;
  image_url?: string | null;
  image_urls?: ImageUrls | null;
  is_featured?: boolean | null;
  is_monthly?: boolean | null;
  is_nsfw?: boolean | null;
  metadata?: Metadata | null;
  name?: string | null;
  num_responses?: number | null;
  ordinal_number?: null;
  patron_count?: number | null;
  position?: number | null;
  post_count?: number | null;
  published?: boolean | null;
  published_at?: string | null;
  question_text?: string | null;
  question_type?: string | null;
  remaining?: null;
  requires_shipping?: boolean | null;
  show_audio_post_download_links?: boolean | null;
  tag_type?: string | null;
  text_content?: string | null;
  title?: string | null;
  unpublished_at?: null;
  url?: string | null;
  user_limit?: null;
  value?: string | null;
}
export interface CursorsOrLinks {
  next: string;
}
export interface ImageUrls {
  default: string;
  original: string;
  thumbnail: string;
}
export interface Metadata {
  dimensions: Dimensions;
}
export interface Dimensions {
  h: number;
  w: number;
}
export interface Relationships1 {
  choices?: AccessRulesOrUserDefinedTagsOrChoices1 | null;
  current_user_responses?: AttachmentsOrCurrentUserResponses1 | null;
  tier?: PollOrTier1 | null;
}
export interface AccessRulesOrUserDefinedTagsOrChoices1 {
  data?: DataEntityOrData[] | null;
}
export interface AttachmentsOrCurrentUserResponses1 {
  data?: null[] | null;
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
