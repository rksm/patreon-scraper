export interface Comments {
  data?: Comment[] | null;
  included?: IncludedEntity[] | null;
  links: Links;
  meta: Meta;
}
export interface Comment {
  attributes: Attributes;
  id: string;
  relationships: Relationships;
  type: string;
}
export interface Attributes {
  body: string;
  created: string;
  current_user_vote: number;
  deleted_at?: null;
  is_by_creator: boolean;
  is_by_patron: boolean;
  reply_count: number;
  vote_sum: number;
}
export interface Relationships {
  commenter?: Parent;
  first_reply: FirstReplyOrCampaign;
  parent?: Parent | null;
  post?: Parent | null;
  campaign?: FirstReplyOrCampaign1 | null;
  flairs?: Flairs | null;
  on_behalf_of_campaign?: { data?: null };
  replies?: { data: { id: string; type: string }[] };
}

export interface Parent {
  data: Data;
  links: { related: string };
}

export interface Data {
  id: string;
  type: string;
}

export interface FirstReplyOrCampaign {
  data?: Data1 | null;
  links?: Links2 | null;
}
export interface Data1 {
  id: string;
  type: string;
}
export interface Links2 {
  related: string;
}
export interface IncludedEntity {
  attributes: Attributes1;
  id: string;
  relationships?: Relationships | null;
  type: string;
}
export interface Attributes1 {
  full_name?: string | null;
  image_url?: string | null;
  url?: string | null;
  comment_count?: number | null;
  body?: string | null;
  created?: string | null;
  current_user_vote?: number | null;
  deleted_at?: null;
  is_by_creator?: boolean | null;
  is_by_patron?: boolean | null;
  reply_count?: number | null;
  vote_sum?: number | null;
  avatar_photo_url?: string | null;
  cover_photo_url?: string | null;
  cover_photo_url_sizes?: CoverPhotoUrlSizes | null;
  created_at?: string | null;
  creation_name?: string | null;
  currency?: string | null;
  earnings_visibility?: string | null;
  image_small_url?: string | null;
  is_charged_immediately?: boolean | null;
  is_monthly?: boolean | null;
  is_nsfw?: boolean | null;
  main_video_embed?: string | null;
  main_video_url?: string | null;
  name?: string | null;
  one_liner?: null;
  pay_per_name?: string | null;
  pledge_sum_currency?: string | null;
  pledge_url?: string | null;
  published_at?: null;
  summary?: string | null;
}
export interface CoverPhotoUrlSizes {
  large: string;
  medium: string;
  small: string;
}
export interface FirstReplyOrCampaign1 {
  data?: Data1 | null;
  links?: Links2 | null;
}
export interface Flairs {
  data?: null[] | null;
}
export interface Links {
  first: string;
  next: string;
}
export interface Meta {
  count: number;
}
